"use client";

import { useState } from "react";
import { ControlGroup } from "./primitives";

export function DataControls({
  onLoad,
  onReset,
  isCustom,
  nodeCount,
  edgeCount,
  defaultDataText,
}: {
  onLoad: (raw: string) => string | null;
  onReset: () => void;
  isCustom: boolean;
  nodeCount: number;
  edgeCount: number;
  defaultDataText: string;
}) {
  const [text, setText] = useState(defaultDataText);
  const [error, setError] = useState<string | null>(null);

  const load = (raw: string) => {
    const err = onLoad(raw);
    setError(err);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const content = await file.text();
    setText(content);
    load(content);
  };

  return (
    <ControlGroup title="Data">
      <p className="text-xs text-zinc-500">
        {isCustom ? "Custom data loaded: " : "Sample dataset: "}
        {nodeCount} nodes, {edgeCount} edges.
      </p>
      <textarea
        className="h-40 w-full resize-y rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-100"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <input type="file" accept="application/json,.json" className="text-xs text-zinc-400" onChange={handleFileChange} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          onClick={() => load(text)}
        >
          Load JSON
        </button>
        <button
          type="button"
          className="flex-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          onClick={() => {
            setText(defaultDataText);
            setError(null);
            onReset();
          }}
        >
          Use sample data
        </button>
      </div>
    </ControlGroup>
  );
}
