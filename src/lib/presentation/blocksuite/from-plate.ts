import { type PlateSlide } from "@/components/presentation/utils/parser";
import { type BSDoc, type BSInline, type BSNode } from "./types";

function toInline(text?: string): BSInline[] {
  if (!text) return [];
  return [{ text }];
}

function isHeadingType(t?: string): t is string {
  if (!t) return false;
  return /^h[1-6]$/.test(t) || t.includes("heading");
}

function headingLevelFromType(t?: string): 1 | 2 | 3 | 4 | 5 | 6 {
  const m = t?.match(/^h([1-6])$/);
  if (m) return Number(m[1]) as 1 | 2 | 3 | 4 | 5 | 6;
  return 2;
}

// Maximum iteration limits to prevent infinite loops
const MAX_ITERATIONS = 1000;
const MAX_DEPTH = 50;

let globalIterations = 0;

// Very generic mapper using duck-typing on Plate element structure
function mapElementToBSNode(el: any, depth = 0): BSNode | null {
  // Prevent infinite recursion
  if (depth > MAX_DEPTH || globalIterations > MAX_ITERATIONS) {
    console.warn("Parser: Maximum depth or iterations reached, stopping to prevent infinite loop");
    return null;
  }
  globalIterations++;
  
  const t = el?.type as string | undefined;
  if (!t) return null;
  const tStr: any = typeof t === "string" ? t : "";

  // Headings
  if (isHeadingType(tStr)) {
    const text = Array.isArray(el.children)
      ? el.children.map((c: any) => c.text || "").join("")
      : el.text || "";
    return { type: "heading", level: headingLevelFromType(tStr), children: toInline(text) };
  }

  // Paragraph
  if (tStr.indexOf("paragraph") !== -1 || tStr === "p") {
    const text = Array.isArray(el.children)
      ? el.children.map((c: any) => c.text || "").join("")
      : el.text || "";
    return { type: "paragraph", children: toInline(text) };
  }

  // Image
  if (tStr.indexOf("image") !== -1) {
    return { type: "image", url: el.url, query: el.query };
  }

  // Bullets / list
  if (tStr.indexOf("bullet") !== -1) {
    const items: Array<BSInline[]> = [];
    const children = Array.isArray(el.children) ? el.children : [];
    for (const item of children) {
      const text = Array.isArray(item.children)
        ? item.children.map((c: any) => c.text || "").join("")
        : item.text || "";
      items.push(toInline(text));
    }
    return { type: "list", style: "bullet", items };
  }

  // Columns
  if (tStr.indexOf("column") !== -1) {
    const cols: BSNode[][] = [];
    const children = Array.isArray(el.children) ? el.children : [];
    for (const col of children) {
      const colChildren = Array.isArray(col.children) ? col.children : [];
      cols.push(colChildren.map((c: any) => mapElementToBSNode(c, depth + 1)).filter(Boolean) as BSNode[]);
    }
    return { type: "columns", columns: cols };
  }

  // Table
  if (tStr.indexOf("table") !== -1) {
    const rows: string[][] = [];
    const children = Array.isArray(el.children) ? el.children : [];
    for (const row of children) {
      const cells = Array.isArray(row.children) ? row.children : [];
      rows.push(cells.map((c: any) => (Array.isArray(c.children) ? c.children.map((x: any) => x.text || "").join("") : c.text || "")));
    }
    return { type: "table", rows };
  }

  // Charts (best-effort)
  if (tStr.indexOf("chart") !== -1) {
    return { type: "chart", charttype: el.charttype || tStr, data: el.data || el.children || [] };
  }

  // Icons - handle complex icon structures
  if (tStr.indexOf("icon") !== -1) {
    // Safely extract text content from icon elements
    const text = Array.isArray(el.children)
      ? el.children.map((c: any) => c.text || "").join("")
      : el.text || "";
    return { type: "paragraph", children: toInline(text) };
  }

  // Pros/Cons - handle comparison structures
  if (tStr.indexOf("pros") !== -1 || tStr.indexOf("cons") !== -1) {
    const text = Array.isArray(el.children)
      ? el.children.map((c: any) => {
          if (typeof c === 'object' && c.children) {
            return c.children.map((child: any) => child.text || "").join("");
          }
          return c.text || "";
        }).join("")
      : el.text || "";
    return { type: "paragraph", children: toInline(text) };
  }

  // Handle any complex nested structures safely
  if (tStr.indexOf("box") !== -1 || tStr.indexOf("compare") !== -1 || 
      tStr.indexOf("staircase") !== -1 || tStr.indexOf("pyramid") !== -1 ||
      tStr.indexOf("timeline") !== -1 || tStr.indexOf("arrows") !== -1 ||
      tStr.indexOf("cycle") !== -1) {
    const text = Array.isArray(el.children)
      ? el.children.map((c: any) => {
          if (typeof c === 'object' && c.children) {
            // Recursively process children but with depth protection
            return c.children.map((child: any) => {
              if (typeof child === 'object' && child.text) return child.text;
              if (typeof child === 'string') return child;
              return "";
            }).join("");
          }
          return c.text || "";
        }).join("")
      : el.text || "";
    return { type: "paragraph", children: toInline(text) };
  }

  // Fallback: treat as paragraph of concatenated text
  const text = Array.isArray(el.children)
    ? el.children.map((c: any) => c.text || "").join("")
    : el.text || "";
  if (text) return { type: "paragraph", children: toInline(text) };
  return null;
}

export function plateSlidesToBlocksuite(slides: PlateSlide[]): BSDoc {
  // Reset iteration counter for each parsing run
  globalIterations = 0;
  
  const pages = slides.map((s) => {
    const nodes: BSNode[] = [];
    for (const n of s.content) {
      const mapped = mapElementToBSNode(n as any);
      if (mapped) nodes.push(mapped);
    }
    // Map layout only if it matches our supported set
    const layout: "left" | "right" | "vertical" | undefined =
      s.layoutType === "left" || s.layoutType === "right" || s.layoutType === "vertical"
        ? s.layoutType
        : undefined;
    const page = {
      id: s.id,
      nodes,
      layout,
      image: s.rootImage ? { url: s.rootImage.url, query: s.rootImage.query } : undefined,
    };
    return page;
  });

  return { version: 1, pages };
}
