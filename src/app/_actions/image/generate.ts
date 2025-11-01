"use server";

import { utapi } from "@/app/api/uploadthing/core";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { UTFile } from "uploadthing/server";
import { POLLINATIONS_MODELS, type PollinationsModel } from "./models";
import { env } from "@/env";
import { enhanceImagePrompt, type EnhancedPrompt } from "./prompt-enhancer";

export type ImageModelList = PollinationsModel["id"];

export async function generateImageAction(
  prompt: string,
  model: ImageModelList = "flux",
  enhancementOptions?: {
    style?: 'professional' | 'creative' | 'minimalist' | 'photorealistic' | 'artistic';
    quality?: 'standard' | 'high' | 'ultra';
    aspectRatio?: 'landscape' | 'portrait' | 'square';
    colorScheme?: 'vibrant' | 'monochrome' | 'warm' | 'cool' | 'natural';
    context?: string;
    enableEnhancement?: boolean;
  }
) {
  // Get the current session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    throw new Error("You must be logged in to generate images");
  }

  try {
    // Enhanced prompt generation (enabled by default for better quality)
    let finalPrompt = prompt;
    let enhancedPromptInfo: EnhancedPrompt | null = null;
    
    if (enhancementOptions?.enableEnhancement !== false) {
      console.log(`🎨 Enhancing image prompt: "${prompt}"`);
      enhancedPromptInfo = enhanceImagePrompt(prompt, {
        style: enhancementOptions?.style || 'professional',
        quality: enhancementOptions?.quality || 'high',
        aspectRatio: enhancementOptions?.aspectRatio || 'landscape',
        colorScheme: enhancementOptions?.colorScheme || 'natural',
        context: enhancementOptions?.context,
        addTechnicalDetails: true
      });
      
      finalPrompt = enhancedPromptInfo.enhanced;
      console.log(`✨ Enhanced prompt: "${finalPrompt}"`);
      console.log(`📊 Quality improvement: ${enhancedPromptInfo.original.length} → ${enhancedPromptInfo.enhanced.length} characters`);
      console.log(`🔧 Enhancements applied: ${enhancedPromptInfo.enhancements.join(', ')}`);
    }

    // Helper: fetch Pollinations image for a specific model
    const tryPollinations = async (modelId: string) => {
      console.log(`Generating image with Pollinations AI using model: ${modelId}`);
      const encodedPrompt = encodeURIComponent(finalPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&model=${modelId}`;
      console.log(`Generated image URL: ${imageUrl}`);

      const maxAttempts = 3;
      let imageResponse: Response | null = null;
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        try {
          console.log(`🔄 [${modelId}] Attempt ${attempt}/${maxAttempts}: Fetching image from Pollinations...`);
          const response = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; PresentationAI/1.0)',
              'Accept': 'image/*',
              'Cache-Control': 'no-cache',
            },
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error body');
            throw new Error(`Pollinations responded with status ${response.status}: ${errorText.substring(0, 100)}`);
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.startsWith('image/')) {
            throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
          }
          imageResponse = response;
          console.log(`✅ [${modelId}] Successfully fetched image on attempt ${attempt}`);
          break;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          lastError = fetchError;
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          console.warn(`❌ [${modelId}] Pollinations attempt ${attempt}/${maxAttempts} failed:`, errorMessage);
          if (attempt < maxAttempts) {
            const backoffTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
            console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
          }
        }
      }

      if (!imageResponse) {
        const errorMessage = lastError instanceof Error ? lastError.message : "Failed to download image from Pollinations AI";
        console.error(`💥 [${modelId}] All ${maxAttempts} attempts failed:`, errorMessage);
        return { ok: false as const, error: errorMessage };
      }

      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();
      const filename = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;
      const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);
      const uploadResult = await utapi.uploadFiles([utFile]);
      if (!uploadResult[0]?.data?.ufsUrl) {
        console.error("Upload error:", uploadResult[0]?.error);
        throw new Error("Failed to upload image to UploadThing");
      }
      const permanentUrl = uploadResult[0].data.ufsUrl;
      console.log(`Uploaded to UploadThing URL: ${permanentUrl}`);
      const generatedImage = await db.generatedImage.create({
        data: { 
          url: permanentUrl, 
          prompt: finalPrompt,
          userId: session.user.id,
        },
      });
      return { ok: true as const, image: generatedImage };
    };

    // Pollinations fallback chain
    const preferredChain: ImageModelList[] = Array.from(
      new Set([
        model, // user selection first
        "turbo",
        "gptimage",
        "kontext",
        "flux",
      ] as ImageModelList[]),
    );

    for (const m of preferredChain) {
      const result = await tryPollinations(m);
      if (result.ok) {
        return { success: true, image: result.image };
      }
      // Try next model in chain
    }

    // Final fallback: Stability AI SD3 (only if API key present)
    if (env.STABILITY_API_KEY) {
      try {
        console.log("🛟 Falling back to Stability AI SD3 generation");
        const form = new FormData();
        form.append("prompt", prompt);
        form.append("output_format", "jpeg");
        // No files field needed per simple text prompt

        const stabilityResponse = await fetch(
          "https://api.stability.ai/v2beta/stable-image/generate/sd3",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.STABILITY_API_KEY}`,
              Accept: "image/*",
            },
            body: form,
          },
        );

        if (!stabilityResponse.ok) {
          let body: string | undefined;
          try {
            body = await stabilityResponse.text();
          } catch {
            /* noop */
          }
          throw new Error(
            `Stability responded with status ${stabilityResponse.status}${body ? `: ${body.substring(0, 120)}` : ""}`,
          );
        }

        const contentType = stabilityResponse.headers.get("content-type");
        if (!contentType || !contentType.startsWith("image/")) {
          throw new Error(`Invalid content type from Stability: ${contentType}`);
        }

        const imageBlob = await stabilityResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();
        const filename = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.jpeg`;
        const utFile = new UTFile([new Uint8Array(imageBuffer)], filename);
        const uploadResult = await utapi.uploadFiles([utFile]);
        if (!uploadResult[0]?.data?.ufsUrl) {
          console.error("Upload error:", uploadResult[0]?.error);
          throw new Error("Failed to upload image to UploadThing");
        }
        const permanentUrl = uploadResult[0].data.ufsUrl;
        console.log(`Uploaded to UploadThing URL: ${permanentUrl}`);
        const generatedImage = await db.generatedImage.create({
          data: { url: permanentUrl, prompt, userId: session.user.id },
        });
        return { success: true, image: generatedImage };
      } catch (err) {
        console.error("Stability fallback failed:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Stability fallback failed",
        };
      }
    }

    // If we reached here, all fallbacks failed and no Stability key available
    return {
      success: false,
      error:
        "All image providers are currently unavailable. Add STABILITY_API_KEY to enable a final fallback.",
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}
