"use client";

import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { LayoutControls } from "./controls/LayoutControls";
import { SpacingControls } from "./controls/SpacingControls";
import { HandleControls } from "./controls/HandleControls";
import { EdgeControls } from "./controls/EdgeControls";
import { NodeControls } from "./controls/NodeControls";
import { ViewControls } from "./controls/ViewControls";
import { DebugControls } from "./controls/DebugControls";
import { DataControls } from "./controls/DataControls";

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
      </div>
      <DataControls
        onLoad={onLoadCustomData}
        onReset={onResetToSampleData}
        isCustom={isCustomData}
        nodeCount={customNodeCount}
        edgeCount={customEdgeCount}
        defaultDataText={defaultDataText}
      />
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
