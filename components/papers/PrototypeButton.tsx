"use client";

import { PrototypePayload } from "@/lib/papers/types";

export function PrototypeButton({
  prototype,
  onSelect,
}: {
  prototype: PrototypePayload;
  onSelect: (prototype: PrototypePayload) => void;
}) {
  return (
    <button
      type="button"
      title={prototype.description}
      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-indigo-500 hover:text-indigo-300"
      onClick={() => onSelect(prototype)}
    >
      {prototype.name}
    </button>
  );
}
