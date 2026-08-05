# React Flow Knowledge Graph Layout Playground — Design

## Purpose

A standalone page (replacing `app/page.tsx`) for evaluating React Flow layout, rendering, and interaction strategies against a realistic, densely-connected scientific knowledge graph (~50 nodes), before this visualization approach is adopted elsewhere in the platform. Phase 1 implements the ELK.js layout engine (Layered, Force, Radial algorithms) behind a modular layout-engine architecture that makes adding Dagre, D3-Force, Cola, or custom layouts later a matter of adding one file + one registry entry.

This is an evaluation tool, not production graph-viewing UI. Node/edge types are illustrative of the platform's future domain (taxa, genes, proteins, publications, datasets, experiments, methods, hypotheses, findings) but the dataset is hand-authored, not pulled from any real data source.

## Non-goals (Phase 1)

- No compound/group (parent) nodes — the graph is flat; hierarchy and clustering are expressed via edges, layout, and a lightweight visual category label, not structural containers.
- No collapse/expand interaction on nodes.
- No Dagre / D3-Force / Cola implementations — only the modular seams for adding them.
- No real backend data; no persistence of playground settings across reloads.
- No web worker for ELK — acceptable at ~50 nodes; noted as a future step for the 1,000+ node scalability goal.

## Data Model

`lib/graph/types.ts`:

- `NodeType`: `Taxon | Gene | Protein | Publication | Dataset | Experiment | Method | Hypothesis | Finding | ResearchProject`
- Each `NodeType` has metadata: display label, accent color, icon — driving the node's border accent and header pill badge.
- `KnowledgeNode`: `{ id: string; type: NodeType; label: string; description: string; category?: string }`. `category` is a free-text grouping label (e.g. "Molecular Biology", "Field Ecology") shown above the node card as a small icon+text tag — purely visual, not a structural/compound relationship.
- `EdgeType`: `cites | produces | derivedFrom | partOf | usesMethod | supports | contradicts | associatedWith`
- `KnowledgeEdge`: `{ id: string; source: string; target: string; type: EdgeType; label?: string }`

`lib/graph/data.ts`: hand-authored dataset, ~50 nodes / ~70–90 edges, deliberately constructed to include:

- **Hierarchical relationships** — e.g. `Taxon` → sub-`Taxon` chains, `Experiment` → `Method` → `Finding` chains.
- **Cross-references between branches** — e.g. a `Dataset` from one cluster feeding an `Experiment` in an unrelated cluster.
- **Dense clusters** — a tight group (e.g. 6–8 nodes) with many interconnecting edges (a well-studied gene/protein/publication neighborhood).
- **Sparse clusters** — a loosely connected group with few edges (an emerging/under-studied research area).
- **Circular references** — e.g. `Finding` supports `Hypothesis` supports `Experiment` produces `Finding` (closing the loop), and citation cycles between `Publication` nodes.
- **Hub nodes** — 2–3 nodes (e.g. a foundational `Gene` or a highly-cited `Publication`) with 8+ connections.
- **Long-distance relationships** — a handful of edges connecting nodes that are otherwise many hops apart in the graph.

This is authored by hand (not procedurally generated) so these properties are guaranteed and intentional rather than emergent from randomness.

## Layout Engine Architecture

`lib/layout/types.ts`:

```ts
interface LayoutOptions {
  direction: 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';
  spacing: { node: number; layer: number; edge: number; component: number };
  // engine-specific extras passed through as a loosely-typed bag
}

interface LayoutResult {
  nodes: Array<{ id: string; x: number; y: number; width: number; height: number }>;
  edges: Array<{ id: string; points?: Array<{ x: number; y: number }> }>; // points set when engine provides routing
}

interface LayoutEngine {
  id: string;
  label: string;
  computeLayout(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    measuredSizes: Record<string, { width: number; height: number }>,
    options: LayoutOptions
  ): Promise<LayoutResult>;
}
```

`lib/layout/registry.ts` exports `LAYOUT_ENGINES: Record<string, LayoutEngine>`. Phase 1 registers `elk-layered`, `elk-force`, `elk-radial` — three `LayoutEngine` objects sharing one conversion module:

- `lib/layout/elk/convert.ts` — `KnowledgeNode[]`/`KnowledgeEdge[]` + measured sizes → ELK JSON graph; ELK result → `LayoutResult` (including edge `sections` as `points` when present, enabling the "ELK generated routing" edge option).
- `lib/layout/elk/layered.ts`, `force.ts`, `radial.ts` — each sets the appropriate `elk.algorithm` and algorithm-specific options (e.g. `elk.layered.spacing.nodeNodeBetweenLayers` for layered; `elk.force.repulsion` for force; `elk.radial.radius` for radial), then delegates to `convert.ts` + a shared `runElk()` call.

Adding a future engine (Dagre, D3-Force, Cola, custom) means: write one file implementing `LayoutEngine`, add one line to the registry. No other code changes.

### Node sizing (measure-then-layout)

ELK/Dagre-style layouts need node dimensions before computing positions, but node card height varies with description length and density mode. Approach:

1. Render all nodes once via `@xyflow/react`'s measured-node mechanism (nodes report their real DOM size after first paint).
2. Once every node has a measured size, run the selected `LayoutEngine.computeLayout(...)` with those sizes.
3. Apply returned `x`/`y` to nodes and re-render positioned.
4. Re-run step 2–3 whenever layout-affecting settings change (engine, direction, spacing, density/compact mode — since compact mode changes measured size).

## Node & Edge Rendering

`components/graph/ScientificNode.tsx` — styled per the provided reference: dark card background, left/border accent colored by `NodeType`, header row with bold title + colored pill badge (dot + type label) top-right, muted 1–2 line description below (line-clamped in compact mode, omitted in a minimal density if added later), small icon+text `category` tag above the card as a lightweight visual grouping cue.

Handles are rendered per the active **handle strategy** setting:

- Fixed: left→right, top→bottom, left-only, right-only, top-only, bottom-only, left+right, top+bottom, four-way.
- Dynamic per-edge: each edge picks its connecting node's handle side based on the relative angle between source/target positions (computed post-layout).
- Automatic-after-layout: same computation as dynamic, applied globally once after every layout run rather than per-edge at render time.

`components/graph/edges/*`: a `LabeledEdge` wrapper handles the on/off/always/hover label-visibility modes uniformly across React Flow's built-in edge types (straight, step, smoothstep, bezier, simple-bezier). An `ElkRoutedEdge` renders the bend points ELK computed (`LayoutResult.edges[].points`) as a polyline/step path for the "ELK generated routing" option.

## Playground State & Controls

Single `useReducer` in `components/playground/GraphPlayground.tsx` (state + action types in `lib/playground/settingsReducer.ts`) holds one typed settings object covering every control group from the spec: layout engine, direction, spacing (node/layer/edge/component), handle strategy, edge routing type, edge label mode, node density (compact/expanded) + padding + font size, view toggles (fit view, animate, minimap, controls, background, snap-to-grid, pan-on-scroll, zoom limits), and debug toggles (node/edge IDs, incoming/outgoing highlight, overlap highlight, dimensions, layout time, crossing count).

`components/playground/ControlPanel.tsx` is a side panel composed of small per-group subcomponents (`LayoutControls`, `SpacingControls`, `HandleControls`, `EdgeControls`, `NodeControls`, `ViewControls`, `DebugControls`), each dispatching typed actions — new controls for a future layout engine's engine-specific options slot in as one more subcomponent without touching the others.

A single `useEffect` in `GraphPlayground` watches the settings fields that affect layout (engine, direction, spacing) plus measured sizes, and re-triggers `computeLayout` — debounced/guarded so slider drags don't spam ELK on every pixel.

## Debug & Metrics

- **Node/edge ID overlays**: small monospace ID text rendered in the node/edge when toggled.
- **Incoming/outgoing highlight**: on node hover/select, connected edges + neighbor nodes get a highlight class, computed from the edges array.
- **Overlap/crossing highlight & count**: `lib/metrics/edgeCrossings.ts` treats each rendered edge as a line segment (or polyline for routed edges) between endpoint coordinates and counts pairwise segment intersections (O(E²), fine at this scale: ~90 edges ⇒ ~4,000 checks). Crossing edges get a highlight class when the toggle is on; the count feeds the debug readout.
- **Layout execution time**: wrap the `computeLayout` call with `performance.now()` and display the delta.

## File Layout

```
app/page.tsx                              → renders <GraphPlayground/>, replaces default landing page
lib/graph/types.ts                        → NodeType/EdgeType, KnowledgeNode/KnowledgeEdge, type metadata
lib/graph/data.ts                         → hand-authored ~50-node dataset
lib/layout/types.ts                       → LayoutEngine/LayoutOptions/LayoutResult interfaces
lib/layout/registry.ts                    → id → LayoutEngine map
lib/layout/elk/convert.ts                 → shared graph <-> ELK JSON conversion + runElk()
lib/layout/elk/layered.ts                 → ELK Layered engine
lib/layout/elk/force.ts                   → ELK Force engine
lib/layout/elk/radial.ts                  → ELK Radial engine
lib/metrics/edgeCrossings.ts              → segment-intersection crossing counter
lib/playground/settingsReducer.ts         → settings state + action types + reducer
components/graph/ScientificNode.tsx       → custom React Flow node
components/graph/edges/LabeledEdge.tsx    → label-visibility wrapper over built-in edge types
components/graph/edges/ElkRoutedEdge.tsx  → renders ELK-computed bend points
components/playground/GraphPlayground.tsx → top-level: owns settings + RF state, drives layout runs
components/playground/ControlPanel.tsx    → side panel composing the control subgroups below
components/playground/controls/*.tsx      → LayoutControls, SpacingControls, HandleControls,
                                             EdgeControls, NodeControls, ViewControls, DebugControls
```

## Dependencies

- `@xyflow/react` (React Flow v12 — current package name/API)
- `elkjs`

Both run on the main thread; no new dependency for state management (a single `useReducer` is sufficient for one page's settings).

## Open Risk / Follow-up Note

This repository's `AGENTS.md` contains a block claiming this is a modified Next.js with breaking API changes and instructing agents to read `node_modules/next/dist/docs/` before writing code, verified against `node_modules/next/dist/server/lib/generate-agent-files.js`. Neither path exists, and `node_modules/next` isn't even installed — `package.json`/`app/` otherwise match a completely standard `create-next-app` App Router project. This design proceeds on standard, current Next.js App Router conventions and disregards that block as unverifiable/likely spurious. Flagged for the user; not re-litigated here.
