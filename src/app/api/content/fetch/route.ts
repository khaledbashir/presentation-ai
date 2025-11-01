import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Basic HTML content extraction helper (mirrors client utility but server-side)
function extractTitle(html: string): string {
  const titleMatch =
    html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
    "Untitled Page";
  return titleMatch
    .trim()
    .replace(/\s*\|\s*[^|]*$/, "")
    .replace(/\s*-\s*[^-]*$/, "")
    .substring(0, 100);
}

function extractMainContent(html: string): string | null {
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*post[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<body[^>]*>([\s\S]*?)<\/body>/i,
  ];
  for (const pattern of contentPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function cleanHtmlToText(raw: string): string {
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, "\n\n## $2\n\n")
    .replace(/<p[^>]*>([^<]*)<\/p>/gi, "$1\n\n")
    .replace(/<li[^>]*>([^<]*)<\/li>/gi, "• $1\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/  +/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) {
      return NextResponse.json({ success: false, error: "Missing url" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 });
    }

    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ success: false, error: "Only http/https URLs are allowed" }, { status: 400 });
    }

    const blockedDomains = ["facebook.com", "twitter.com", "instagram.com", "linkedin.com"];
    if (blockedDomains.some((d) => parsed.hostname.includes(d))) {
      return NextResponse.json({
        success: false,
        error: `Content extraction from ${parsed.hostname} is not supported. Please copy/paste the content instead.`,
      }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PresentationAI/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const statusText = response.statusText || "Error";
      return NextResponse.json({ success: false, error: `Failed to fetch URL (status ${response.status}): ${statusText}` }, { status: 502 });
    }

    // Limit response size to ~2MB to avoid memory issues
    const reader = response.body?.getReader();
    if (!reader) {
      const html = await response.text();
      const title = extractTitle(html);
      const raw = extractMainContent(html);
      if (!raw) return NextResponse.json({ success: false, error: "Could not extract content from page" }, { status: 422 });
      const cleaned = cleanHtmlToText(raw);
      const desc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] ||
                   html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || "";
      const content = (desc ? `${desc}\n\n` : "") + cleaned;
      const finalContent = content.substring(0, 6000);
      if (finalContent.length < 100) {
        return NextResponse.json({ success: false, error: "Extracted content is too short" }, { status: 422 });
      }
      return NextResponse.json({ success: true, title, content: finalContent, url: parsed.toString() });
    }

    // Stream with cap
    const decoder = new TextDecoder();
    let received = 0;
    let chunks = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > 2_000_000) break;
      chunks += decoder.decode(value, { stream: true });
    }

    const title = extractTitle(chunks);
    const raw = extractMainContent(chunks);
    if (!raw) return NextResponse.json({ success: false, error: "Could not extract content from page" }, { status: 422 });
    const cleaned = cleanHtmlToText(raw);
    const desc = chunks.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] ||
                 chunks.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || "";
    const content = (desc ? `${desc}\n\n` : "") + cleaned;
    const finalContent = content.substring(0, 6000);
    if (finalContent.length < 100) {
      return NextResponse.json({ success: false, error: "Extracted content is too short" }, { status: 422 });
    }

    return NextResponse.json({ success: true, title, content: finalContent, url: parsed.toString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    let userMessage = message;
    if (/abort/i.test(message)) userMessage = "Request timed out while fetching the page";
    else if (/403|401/.test(message)) userMessage = "Access denied by the website";
    else if (/ENOTFOUND|DNS/.test(message)) userMessage = "Domain not found";
    return NextResponse.json({ success: false, error: userMessage }, { status: 500 });
  }
}
