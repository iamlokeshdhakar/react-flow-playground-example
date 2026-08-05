import { HandleStrategy } from "@/lib/playground/settingsReducer";

export type Side = "top" | "right" | "bottom" | "left";

export interface HandleAssignment {
  sourceSide: Side;
  targetSide: Side;
}

/** Picks the cardinal side each end of an edge should connect from, based on relative position. */
export function pickHandleSides(from: { x: number; y: number }, to: { x: number; y: number }): HandleAssignment {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { sourceSide: "right", targetSide: "left" } : { sourceSide: "left", targetSide: "right" };
  }
  return dy >= 0 ? { sourceSide: "bottom", targetSide: "top" } : { sourceSide: "top", targetSide: "bottom" };
}

/** Which sides a ScientificNode should render handles on for a given strategy. */
export function sidesForStrategy(strategy: HandleStrategy): Side[] {
  switch (strategy) {
    case "left-right":
    case "left+right":
      return ["left", "right"];
    case "top-bottom":
    case "top+bottom":
      return ["top", "bottom"];
    case "left-only":
      return ["left"];
    case "right-only":
      return ["right"];
    case "top-only":
      return ["top"];
    case "bottom-only":
      return ["bottom"];
    case "four-way":
    case "dynamic":
    case "auto-after-layout":
      return ["top", "right", "bottom", "left"];
  }
}

/**
 * "directional" strategies fix one role per side (e.g. left is always a target, right always a
 * source). "both" strategies render a source and a target handle stacked at every active side,
 * and the specific side used per edge is resolved by pickHandleSides (clamped to allowed sides).
 */
export function rolesForStrategy(strategy: HandleStrategy): "directional" | "both" {
  return strategy === "left-right" || strategy === "top-bottom" ? "directional" : "both";
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", right: "left", bottom: "top", left: "right" };

/** Snaps a preferred side to the nearest side present in `allowed`. */
export function clampSideToAllowed(preferred: Side, allowed: Side[]): Side {
  if (allowed.includes(preferred)) return preferred;
  if (allowed.includes(OPPOSITE[preferred])) return OPPOSITE[preferred];
  return allowed[0];
}

/** Fixed source/target side for "directional" strategies (left-right, top-bottom). */
export function directionalSides(strategy: HandleStrategy): HandleAssignment {
  if (strategy === "top-bottom") return { sourceSide: "bottom", targetSide: "top" };
  return { sourceSide: "right", targetSide: "left" };
}

export function handleId(side: Side, role: "source" | "target"): string {
  return `${side}-${role}`;
}
