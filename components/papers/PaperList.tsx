"use client";

import { Paper, PrototypePayload } from "@/lib/papers/types";
import { PrototypeButton } from "./PrototypeButton";

export function PaperList({
  papers,
  onSelectPrototype,
}: {
  papers: Paper[];
  onSelectPrototype: (paper: Paper, prototype: PrototypePayload) => void;
}) {
  if (papers.length === 0) {
    return <p className="text-sm text-zinc-500">No papers available.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {papers.map((paper) => {
        const link = paper.pdf ?? paper.paperUrl;
        return (
          <li
            key={paper.id}
            className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-zinc-100">{paper.title}</p>
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Open paper <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p className="text-xs text-zinc-600">No paper link available</p>
              )}
            </div>
            {paper.prototypes.length === 0 ? (
              <p className="text-xs text-zinc-600">No prototypes available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {paper.prototypes.map((prototype) => (
                  <PrototypeButton
                    key={prototype.id}
                    prototype={prototype}
                    onSelect={(selected) => onSelectPrototype(paper, selected)}
                  />
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
