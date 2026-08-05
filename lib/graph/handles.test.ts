import { describe, it, expect } from "vitest";
import { pickHandleSides, sidesForStrategy, rolesForStrategy, clampSideToAllowed } from "./handles";

describe("pickHandleSides", () => {
  it("picks right/left for a target directly to the right", () => {
    expect(pickHandleSides({ x: 0, y: 0 }, { x: 100, y: 0 })).toEqual({ sourceSide: "right", targetSide: "left" });
  });

  it("picks bottom/top for a target directly below", () => {
    expect(pickHandleSides({ x: 0, y: 0 }, { x: 0, y: 100 })).toEqual({ sourceSide: "bottom", targetSide: "top" });
  });

  it("prefers the dominant axis when both dx and dy are non-zero", () => {
    expect(pickHandleSides({ x: 0, y: 0 }, { x: 100, y: 10 })).toEqual({ sourceSide: "right", targetSide: "left" });
  });
});

describe("sidesForStrategy", () => {
  it("returns exactly the active sides for single-side strategies", () => {
    expect(sidesForStrategy("left-only")).toEqual(["left"]);
    expect(sidesForStrategy("top-only")).toEqual(["top"]);
  });

  it("returns all four sides for four-way/dynamic/auto-after-layout", () => {
    expect(sidesForStrategy("four-way")).toEqual(["top", "right", "bottom", "left"]);
    expect(sidesForStrategy("dynamic")).toEqual(["top", "right", "bottom", "left"]);
    expect(sidesForStrategy("auto-after-layout")).toEqual(["top", "right", "bottom", "left"]);
  });
});

describe("rolesForStrategy", () => {
  it("is directional only for left-right and top-bottom", () => {
    expect(rolesForStrategy("left-right")).toBe("directional");
    expect(rolesForStrategy("top-bottom")).toBe("directional");
    expect(rolesForStrategy("four-way")).toBe("both");
    expect(rolesForStrategy("left+right")).toBe("both");
  });
});

describe("clampSideToAllowed", () => {
  it("keeps the preferred side when allowed", () => {
    expect(clampSideToAllowed("top", ["top", "bottom"])).toBe("top");
  });

  it("falls back to the first allowed side when neither preferred nor its opposite is allowed", () => {
    expect(clampSideToAllowed("top", ["left", "right"])).toBe("left");
  });

  it("snaps to the opposite side when preferred is disallowed but its opposite is allowed", () => {
    expect(clampSideToAllowed("top", ["bottom", "left"])).toBe("bottom");
  });
});
