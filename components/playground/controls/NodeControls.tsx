"use client";

import { KNOWLEDGE_NODES } from "@/lib/graph/data";
import { NodeDensity, PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SelectField, SliderField } from "./primitives";

const DENSITY_OPTIONS: { value: NodeDensity; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "expanded", label: "Expanded" },
];

const TOTAL_NODE_COUNT = KNOWLEDGE_NODES.length;
const NODE_LIMIT_VALUES = Array.from(new Set([5, 10, 25, TOTAL_NODE_COUNT])).filter((n) => n <= TOTAL_NODE_COUNT);
const NODE_LIMIT_OPTIONS = NODE_LIMIT_VALUES.map((n) => ({
  value: String(n),
  label: n >= TOTAL_NODE_COUNT ? `All (${TOTAL_NODE_COUNT})` : `${n} nodes`,
}));

export function NodeControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  return (
    <ControlGroup title="Nodes">
      <SelectField
        label="Node limit"
        value={String(Math.min(settings.nodeLimit, TOTAL_NODE_COUNT))}
        options={NODE_LIMIT_OPTIONS}
        onChange={(value) => dispatch({ type: "SET_NODE_LIMIT", limit: Number(value) })}
      />
      <SelectField
        label="Density"
        value={settings.nodeDensity}
        options={DENSITY_OPTIONS}
        onChange={(density) => dispatch({ type: "SET_NODE_DENSITY", density })}
      />
      <SliderField
        label="Padding"
        value={settings.nodePadding}
        min={4}
        max={32}
        onChange={(value) => dispatch({ type: "SET_NODE_PADDING", value })}
      />
      <SliderField
        label="Font size"
        value={settings.fontSize}
        min={10}
        max={20}
        onChange={(value) => dispatch({ type: "SET_FONT_SIZE", value })}
      />
    </ControlGroup>
  );
}
