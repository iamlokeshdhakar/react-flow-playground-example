"use client";

import { useState } from "react";
import { Paper, PrototypePayload } from "@/lib/papers/types";
import { loadPapers } from "@/lib/papers/loadPapers";
import { PaperList } from "./PaperList";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; papers: Paper[] }
  | { status: "error"; message: string };

/**
 * Temporary client-demo feature. Self-contained: owns its own open/fetch state and
 * talks to the existing playground only through `onSelectPayload`, the same
 * (raw: string) => string | null contract as the existing "Load JSON" control.
 */
export function PaperPrototypeViewer({
  onSelectPayload,
}: {
  onSelectPayload: (raw: string) => string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [selectError, setSelectError] = useState<string | null>(null);

  const open = () => {
    setIsOpen(true);
    setSelectError(null);
    if (fetchState.status === "loaded") return;
    setFetchState({ status: "loading" });
    loadPapers().then((result) => {
      if (result.error) {
        setFetchState({ status: "error", message: result.error });
      } else {
        setFetchState({ status: "loaded", papers: result.papers });
      }
    });
  };

  const handleSelect = (paper: Paper, prototype: PrototypePayload) => {
    const raw = JSON.stringify(prototype.payload);
    const error = onSelectPayload(raw);
    if (error) {
      setSelectError(`${paper.title} — ${prototype.name}: ${error}`);
      return;
    }
    setSelectError(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-indigo-500/40 bg-indigo-500/10 px-2 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-500 hover:bg-indigo-500/20"
        onClick={open}
      >
        <span aria-hidden="true">📄</span> Browse Papers
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Papers &amp; Prototypes</h2>
                <p className="text-xs text-zinc-500">Compare extraction prototypes for each paper.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              {fetchState.status === "loading" && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
                  Loading papers…
                </div>
              )}
              {fetchState.status === "error" && <p className="text-sm text-red-400">{fetchState.message}</p>}
              {fetchState.status === "loaded" && (
                <PaperList papers={fetchState.papers} onSelectPrototype={handleSelect} />
              )}
              {selectError && (
                <p className="mt-3 rounded border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-400">
                  {selectError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
