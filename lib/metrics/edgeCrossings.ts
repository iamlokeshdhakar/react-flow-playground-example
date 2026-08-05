export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  id: string;
  a: Point;
  b: Point;
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function pointsEqual(p: Point, q: Point): boolean {
  return Math.abs(p.x - q.x) < 0.001 && Math.abs(p.y - q.y) < 0.001;
}

function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

export function countEdgeCrossings(segments: Segment[]): {
  count: number;
  crossingPairs: [string, string][];
  crossingEdgeIds: Set<string>;
} {
  const crossingPairs: [string, string][] = [];
  const crossingEdgeIds = new Set<string>();

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i];
      const b = segments[j];
      if (a.id === b.id) continue;

      const sharesEndpoint =
        pointsEqual(a.a, b.a) ||
        pointsEqual(a.a, b.b) ||
        pointsEqual(a.b, b.a) ||
        pointsEqual(a.b, b.b);
      if (sharesEndpoint) continue;

      if (segmentsIntersect(a.a, a.b, b.a, b.b)) {
        crossingPairs.push([a.id, b.id]);
        crossingEdgeIds.add(a.id);
        crossingEdgeIds.add(b.id);
      }
    }
  }

  return { count: crossingPairs.length, crossingPairs, crossingEdgeIds };
}
