"use client";

import { PlaygroundSettings, SettingsAction } from "@/lib/playground/settingsReducer";
import { ControlGroup, SliderField, ToggleField } from "./primitives";

export function ViewControls({
  settings,
  dispatch,
}: {
  settings: PlaygroundSettings;
  dispatch: (a: SettingsAction) => void;
}) {
  const view = settings.view;
  const set = (key: keyof PlaygroundSettings["view"], value: boolean | number) =>
    dispatch({ type: "SET_VIEW_OPTION", key, value });

  return (
    <ControlGroup title="View">
      <ToggleField label="Fit view" checked={view.fitView} onChange={(v) => set("fitView", v)} />
      <ToggleField label="Animate layout transitions" checked={view.animateLayout} onChange={(v) => set("animateLayout", v)} />
      <ToggleField label="Show minimap" checked={view.showMiniMap} onChange={(v) => set("showMiniMap", v)} />
      <ToggleField label="Show controls" checked={view.showControls} onChange={(v) => set("showControls", v)} />
      <ToggleField label="Show background grid" checked={view.showBackground} onChange={(v) => set("showBackground", v)} />
      <ToggleField label="Snap to grid" checked={view.snapToGrid} onChange={(v) => set("snapToGrid", v)} />
      <ToggleField label="Pan on scroll" checked={view.panOnScroll} onChange={(v) => set("panOnScroll", v)} />
      <SliderField label="Min zoom" value={view.minZoom} min={0.1} max={1} step={0.1} onChange={(v) => set("minZoom", v)} />
      <SliderField label="Max zoom" value={view.maxZoom} min={1} max={4} step={0.1} onChange={(v) => set("maxZoom", v)} />
      <ToggleField label="Dark mode (scientific view)" checked={view.darkMode} onChange={(v) => set("darkMode", v)} />
    </ControlGroup>
  );
}
