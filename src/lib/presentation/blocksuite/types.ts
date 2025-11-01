// Lightweight, dependency-free representation of a Blocksuite-like document
// This is an intermediate shape we can later map to real Blocksuite structures.

export type BSInline = { text: string; bold?: boolean; italic?: boolean };

export type BSNode =
  | { type: "page"; id: string; children: BSNode[]; title?: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: BSInline[] }
  | { type: "paragraph"; children: BSInline[] }
  | { type: "image"; url?: string; query?: string }
  | { type: "list"; style: "bullet" | "number"; items: Array<BSInline[]> }
  | { type: "columns"; columns: BSNode[][] }
  | { type: "table"; header?: string[]; rows: string[][] }
  | { type: "chart"; charttype: string; data: unknown }
  | { type: "box-grid"; items: Array<{ title?: string; text?: string }> }
  | { type: "before-after"; before: string; after: string }
  | { type: "pros-cons"; pros: string[]; cons: string[] }
  | { type: "timeline"; items: Array<{ label: string; text: string }> }
  | { type: "pyramid"; items: Array<{ title: string; text?: string }> }
  | { type: "staircase"; items: Array<{ title: string; text?: string }> }
  | { type: "arrows"; items: Array<{ title: string; text?: string }> }
  | { type: "icons"; items: Array<{ icon?: string; title?: string; text?: string }> };

export interface BSDoc {
  version: 1;
  pages: Array<{ id: string; nodes: BSNode[]; layout?: "left" | "right" | "vertical"; image?: { url?: string; query?: string } }>;
}
