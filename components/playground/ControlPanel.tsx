"use client";

import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { OperationStatus } from "@/lib/graph/types";
import { OperationStatusCount } from "@/lib/graph/subset";
import { LayoutControls } from "./controls/LayoutControls";
import { SpacingControls } from "./controls/SpacingControls";
import { HandleControls } from "./controls/HandleControls";
import { EdgeControls } from "./controls/EdgeControls";
import { NodeControls } from "./controls/NodeControls";
import { ViewControls } from "./controls/ViewControls";
import { DebugControls } from "./controls/DebugControls";
import { DataControls } from "./controls/DataControls";
import { OperationFilterControls } from "./controls/OperationFilterControls";
import { PaperPrototypeViewer } from "@/components/papers/PaperPrototypeViewer";

export function ControlPanel({
  settings,
  dispatch,
  totalNodeCount,
  onLoadCustomData,
  onResetToSampleData,
  isCustomData,
  customNodeCount,
  customEdgeCount,
  defaultDataText,
  operationCounts,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
  totalNodeCount: number;
  onLoadCustomData: (raw: string) => string | null;
  onResetToSampleData: () => void;
  isCustomData: boolean;
  customNodeCount: number;
  customEdgeCount: number;
  defaultDataText: string;
  operationCounts: Record<OperationStatus, OperationStatusCount>;
}) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">Layout Playground</h2>
        <button
          type="button"
          className="mt-2 w-full rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Reset to defaults
        </button>
        <PaperPrototypeViewer onSelectPayload={onLoadCustomData} />
      </div>
      <DataControls
        onLoad={onLoadCustomData}
        onReset={onResetToSampleData}
        isCustom={isCustomData}
        nodeCount={customNodeCount}
        edgeCount={customEdgeCount}
        defaultDataText={defaultDataText}
      />
      <OperationFilterControls settings={settings} dispatch={dispatch} counts={operationCounts} />
      <LayoutControls settings={settings} dispatch={dispatch} />
      <SpacingControls settings={settings} dispatch={dispatch} />
      <HandleControls settings={settings} dispatch={dispatch} />
      <EdgeControls settings={settings} dispatch={dispatch} />
      <NodeControls settings={settings} dispatch={dispatch} totalNodeCount={totalNodeCount} />
      <ViewControls settings={settings} dispatch={dispatch} />
      <DebugControls settings={settings} dispatch={dispatch} />
    </aside>
  );
}
