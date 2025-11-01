"use client";

import { usePresentationState } from "@/states/presentation-state";
import { plateSlidesToBlocksuite } from "@/lib/presentation/blocksuite/from-plate";
import { useMemo } from "react";

export default function BlocksuitePreviewPage() {
  const { slides, currentPresentationTitle } = usePresentationState();

  const doc = useMemo(() => plateSlidesToBlocksuite(slides), [slides]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Blocksuite Doc Preview</h1>
      <p className="text-sm text-muted-foreground">
        Presentation: {currentPresentationTitle ?? "Untitled"}
      </p>
      <div className="rounded-md border bg-card p-4">
        <pre className="whitespace-pre-wrap text-xs">
{JSON.stringify(doc, null, 2)}
        </pre>
      </div>
      <p className="text-xs text-muted-foreground">
        This is an intermediate JSON representation. Next step: hydrate a real Blocksuite document from this data and render an interactive editor.
      </p>
    </div>
  );
}
