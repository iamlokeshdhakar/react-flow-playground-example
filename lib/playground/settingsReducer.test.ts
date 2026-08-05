import { describe, it, expect } from "vitest";
import { settingsReducer, INITIAL_SETTINGS } from "./settingsReducer";

describe("settingsReducer", () => {
  it("SET_LAYOUT_ENGINE updates only layoutEngineId", () => {
    const next = settingsReducer(INITIAL_SETTINGS, { type: "SET_LAYOUT_ENGINE", id: "elk-force" });
    expect(next.layoutEngineId).toBe("elk-force");
    expect(next.direction).toBe(INITIAL_SETTINGS.direction);
    expect(next.spacing).toEqual(INITIAL_SETTINGS.spacing);
  });

  it("SET_SPACING updates only the targeted spacing key", () => {
    const next = settingsReducer(INITIAL_SETTINGS, { type: "SET_SPACING", key: "layer", value: 999 });
    expect(next.spacing.layer).toBe(999);
    expect(next.spacing.node).toBe(INITIAL_SETTINGS.spacing.node);
  });

  it("SET_VIEW_OPTION updates only the targeted view key", () => {
    const next = settingsReducer(INITIAL_SETTINGS, { type: "SET_VIEW_OPTION", key: "showMiniMap", value: false });
    expect(next.view.showMiniMap).toBe(false);
    expect(next.view.showControls).toBe(INITIAL_SETTINGS.view.showControls);
  });

  it("SET_DEBUG_OPTION updates only the targeted debug key", () => {
    const next = settingsReducer(INITIAL_SETTINGS, { type: "SET_DEBUG_OPTION", key: "showNodeIds", value: true });
    expect(next.debug.showNodeIds).toBe(true);
    expect(next.debug.showEdgeIds).toBe(INITIAL_SETTINGS.debug.showEdgeIds);
  });

  it("RESET returns to INITIAL_SETTINGS regardless of prior state", () => {
    const mutated = settingsReducer(INITIAL_SETTINGS, { type: "SET_LAYOUT_ENGINE", id: "elk-radial" });
    expect(settingsReducer(mutated, { type: "RESET" })).toEqual(INITIAL_SETTINGS);
  });

  it("returns the same state reference for an unrecognized action", () => {
    // @ts-expect-error - deliberately invalid action type to test the default branch
    const next = settingsReducer(INITIAL_SETTINGS, { type: "NOT_REAL" });
    expect(next).toBe(INITIAL_SETTINGS);
  });
});
