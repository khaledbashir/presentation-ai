import { env } from "@/env";
import { tavily } from "@tavily/core";
import { type Tool } from "ai";
import z from "zod";

const tavilyService = env.TAVILY_API_KEY ? tavily({ apiKey: env.TAVILY_API_KEY }) : null;

export const search_tool: Tool = {
  description:
    "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events like news, weather, stock price etc. Input should be a search query.",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      console.log("🔍 Executing web search:", query);
      
      if (!tavilyService) {
        const errorMsg = "⚠️ Tavily API key not configured. Set TAVILY_API_KEY environment variable to enable web search.";
        console.warn(errorMsg);
        return JSON.stringify({ 
          error: "Search service not configured", 
          message: "TAVILY_API_KEY environment variable is not set",
          query,
          results: [],
          fallback: true
        });
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Search timeout after 15 seconds")), 15000),
      );

      // Prefer today's results, then week, then month
      const ranges: Array<{ label: string; value: "d" | "w" | "m" }> = [
        { label: "today", value: "d" },
        { label: "week", value: "w" },
        { label: "month", value: "m" },
      ];

      let chosen: any = null;
      let usedRange: "d" | "w" | "m" | null = null;

      for (const r of ranges) {
        try {
          console.log(`🗓️ Searching (${r.label}) for query:`, query);
          const searchPromise = tavilyService.search(query, {
            max_results: 3,
            search_depth: "basic",
            include_answer: false,
            include_raw_content: false,
            // Tavily time filter: d = day, w = week, m = month, y = year
            time_range: r.value as any,
          } as any);

          const response = (await Promise.race([searchPromise, timeoutPromise])) as any;
          const count = response?.results?.length || 0;
          console.log(`✅ Search (${r.label}) completed. Results:`, count);
          if (count > 0) {
            chosen = response;
            usedRange = r.value;
            break;
          }
          // keep last empty response for reporting if all empty
          chosen = response;
          usedRange = r.value;
        } catch (e) {
          console.warn(`⚠️ Search (${r.label}) failed:`, e instanceof Error ? e.message : String(e));
          // try next range
        }
      }

      return JSON.stringify({
        ...(chosen || {}),
        query,
        success: true,
        fallback: false,
        used_time_range: usedRange,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("❌ Search error for query:", query, "Error:", errorMsg);
      return JSON.stringify({ 
        error: "Search failed", 
        message: errorMsg,
        query,
        results: [],
        fallback: true
      });
    }
  },
};
