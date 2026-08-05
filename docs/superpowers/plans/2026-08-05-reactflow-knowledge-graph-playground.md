# React Flow Knowledge Graph Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js page at `/` that lets us compare React Flow layout/rendering strategies (starting with ELK Layered/Force/Radial) against a realistic, hand-authored ~50-node scientific knowledge graph, via a live control panel.

**Architecture:** Pure-logic layers (graph data, layout engine registry, ELK conversion, edge-crossing metrics, settings reducer) are framework-agnostic TypeScript in `lib/`, unit-tested with Vitest. The UI layer (`components/`) consumes them: a `GraphPlayground` component owns a `useReducer` settings store and React Flow state, measures node sizes, runs the selected `LayoutEngine`, and renders a `ScientificNode`/edge components plus a `ControlPanel`. Design doc: `docs/superpowers/specs/2026-08-05-reactflow-knowledge-graph-playground-design.md`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, `@xyflow/react` (React Flow v12), `elkjs`, Vitest (new).

## Global Constraints

- Node/edge data model, layout engine interface, and UI controls must match the approved design doc exactly (file layout, type names, function signatures) — later tasks depend on the exact names defined in earlier ones.
- No compound/group nodes, no collapse/expand interaction (explicitly out of scope per design).
- No web worker for ELK (main thread is fine at ~50 nodes).
- Pure logic in `lib/` gets Vitest unit tests written test-first. UI in `components/` has no unit-test framework added for it — verify visually via `pnpm dev` + the Playwright browser tool (navigate, snapshot, screenshot, check console) before marking a UI task done, per this session's convention of testing frontend changes in a real browser.
- Repository currently has no `.git` — Task 1 initializes it (a `.gitignore` already exists, so version control was clearly intended, just never started). Every subsequent task ends with a commit.

---

## Task 1: Repo git init + Vitest setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDependency, `"test": "vitest run"` script)
- Create: `lib/smoke.test.ts`

**Interfaces:**
- Produces: `pnpm test` runs Vitest against `lib/**/*.test.ts`, with `@/*` resolving to the repo root (matching `tsconfig.json`'s path alias).

- [ ] **Step 1: Initialize git**

```bash
git init
git add -A
git commit -m "chore: initial commit of create-next-app scaffold"
```

- [ ] **Step 2: Install Vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Add `test` script to `package.json`**

Add `"test": "vitest run"` alongside the existing `dev`/`build`/`start`/`lint` scripts.

- [ ] **Step 5: Write a trivial smoke test**

```ts
// lib/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run it and confirm it passes**

Run: `pnpm test`
Expected: 1 passed test file, 1 passed test.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml lib/smoke.test.ts
git commit -m "chore: add vitest test runner"
```

---

## Task 2: Graph domain types & node/edge type metadata

**Files:**
- Create: `lib/graph/types.ts`
- Test: `lib/graph/types.test.ts`

**Interfaces:**
- Produces: `NodeType`, `EdgeType`, `KnowledgeNode`, `KnowledgeEdge`, `NodeTypeMeta`, `NODE_TYPE_META: Record<NodeType, NodeTypeMeta>`, `EDGE_TYPE_META: Record<EdgeType, { label: string }>`, `NODE_TYPES: NodeType[]`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/graph/types.test.ts
import { describe, it, expect } from "vitest";
import { NODE_TYPE_META, EDGE_TYPE_META, NODE_TYPES } from "./types";

describe("node/edge type metadata", () => {
  it("has exactly 10 node types, each with a non-empty label, hex color, icon, and category", () => {
    expect(NODE_TYPES).toHaveLength(10);
    for (const type of NODE_TYPES) {
      const meta = NODE_TYPE_META[type];
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.category.length).toBeGreaterThan(0);
    }
  });

  it("has exactly 8 edge types, each with a non-empty label", () => {
    const edgeTypes = Object.keys(EDGE_TYPE_META);
    expect(edgeTypes).toHaveLength(8);
    for (const type of edgeTypes) {
      expect(EDGE_TYPE_META[type as keyof typeof EDGE_TYPE_META].label.length).toBeGreaterThan(0);
    }
  });

  it("has unique colors across node types", () => {
    const colors = NODE_TYPES.map((t) => NODE_TYPE_META[t].color);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/graph/types.test.ts`
Expected: FAIL — `./types` does not exist yet.

- [ ] **Step 3: Write `lib/graph/types.ts`**

```ts
export type NodeType =
  | "Taxon"
  | "Gene"
  | "Protein"
  | "Publication"
  | "Dataset"
  | "Experiment"
  | "Method"
  | "Hypothesis"
  | "Finding"
  | "ResearchProject";

export type EdgeType =
  | "cites"
  | "produces"
  | "derivedFrom"
  | "partOf"
  | "usesMethod"
  | "supports"
  | "contradicts"
  | "associatedWith";

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
}

export interface NodeTypeMeta {
  label: string;
  color: string;
  icon: string;
  category: string;
}

export const NODE_TYPE_META: Record<NodeType, NodeTypeMeta> = {
  Taxon: { label: "Taxon", color: "#22c55e", icon: "\u{1F98E}", category: "Taxonomy & Phylogeny" },
  Gene: { label: "Gene", color: "#a855f7", icon: "\u{1F9EC}", category: "Molecular Biology" },
  Protein: { label: "Protein", color: "#f59e0b", icon: "\u{269B}\u{FE0F}", category: "Molecular Biology" },
  Publication: { label: "Publication", color: "#3b82f6", icon: "\u{1F4C4}", category: "Literature" },
  Dataset: { label: "Dataset", color: "#06b6d4", icon: "\u{1F4CA}", category: "Data Infrastructure" },
  Experiment: { label: "Experiment", color: "#ec4899", icon: "\u{1F9EA}", category: "Experiments" },
  Method: { label: "Method", color: "#eab308", icon: "\u{1F6E0}\u{FE0F}", category: "Methods" },
  Hypothesis: { label: "Hypothesis", color: "#6366f1", icon: "\u{1F4A1}", category: "Hypotheses" },
  Finding: { label: "Finding", color: "#14b8a6", icon: "\u{1F50E}", category: "Findings" },
  ResearchProject: { label: "Research Project", color: "#f43f5e", icon: "\u{1F5C2}\u{FE0F}", category: "Program" },
};

export const NODE_TYPES: NodeType[] = Object.keys(NODE_TYPE_META) as NodeType[];

export const EDGE_TYPE_META: Record<EdgeType, { label: string }> = {
  cites: { label: "cites" },
  produces: { label: "produces" },
  derivedFrom: { label: "derived from" },
  partOf: { label: "part of" },
  usesMethod: { label: "uses method" },
  supports: { label: "supports" },
  contradicts: { label: "contradicts" },
  associatedWith: { label: "associated with" },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/graph/types.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/graph/types.ts lib/graph/types.test.ts
git commit -m "feat: add knowledge graph domain types and type metadata"
```

---

## Task 3: Hand-authored ~50-node dataset

**Files:**
- Create: `lib/graph/data.ts`
- Test: `lib/graph/data.test.ts`

**Interfaces:**
- Consumes: `KnowledgeNode`, `KnowledgeEdge`, `NodeType` from `lib/graph/types.ts`.
- Produces: `KNOWLEDGE_NODES: KnowledgeNode[]`, `KNOWLEDGE_EDGES: KnowledgeEdge[]`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/graph/data.test.ts
import { describe, it, expect } from "vitest";
import { KNOWLEDGE_NODES, KNOWLEDGE_EDGES } from "./data";

function degreeMap(edges: { source: string; target: string }[]) {
  const degree: Record<string, number> = {};
  for (const e of edges) {
    degree[e.source] = (degree[e.source] ?? 0) + 1;
    degree[e.target] = (degree[e.target] ?? 0) + 1;
  }
  return degree;
}

function hasCycle(nodeIds: string[], edges: { source: string; target: string }[]): boolean {
  const adjacency: Record<string, string[]> = {};
  for (const id of nodeIds) adjacency[id] = [];
  for (const e of edges) adjacency[e.source].push(e.target);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  for (const id of nodeIds) color[id] = WHITE;

  function visit(id: string): boolean {
    color[id] = GRAY;
    for (const next of adjacency[id]) {
      if (color[next] === GRAY) return true;
      if (color[next] === WHITE && visit(next)) return true;
    }
    color[id] = BLACK;
    return false;
  }

  return nodeIds.some((id) => color[id] === WHITE && visit(id));
}

describe("hand-authored knowledge graph dataset", () => {
  it("has approximately 50 nodes with unique ids", () => {
    expect(KNOWLEDGE_NODES.length).toBeGreaterThanOrEqual(45);
    expect(KNOWLEDGE_NODES.length).toBeLessThanOrEqual(55);
    const ids = KNOWLEDGE_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique edge ids", () => {
    const ids = KNOWLEDGE_EDGES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no dangling edge references", () => {
    const nodeIds = new Set(KNOWLEDGE_NODES.map((n) => n.id));
    for (const edge of KNOWLEDGE_EDGES) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it("includes at least 2 hub nodes with 8 or more connections", () => {
    const degree = degreeMap(KNOWLEDGE_EDGES);
    const hubs = Object.values(degree).filter((d) => d >= 8);
    expect(hubs.length).toBeGreaterThanOrEqual(2);
  });

  it("includes at least one sparsely-connected node (degree 1-2)", () => {
    const degree = degreeMap(KNOWLEDGE_EDGES);
    const nodeIds = KNOWLEDGE_NODES.map((n) => n.id);
    const sparse = nodeIds.filter((id) => (degree[id] ?? 0) <= 2);
    expect(sparse.length).toBeGreaterThan(0);
  });

  it("contains at least one directed cycle", () => {
    const nodeIds = KNOWLEDGE_NODES.map((n) => n.id);
    expect(hasCycle(nodeIds, KNOWLEDGE_EDGES)).toBe(true);
  });

  it("represents all 10 node types", () => {
    const types = new Set(KNOWLEDGE_NODES.map((n) => n.type));
    expect(types.size).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/graph/data.test.ts`
Expected: FAIL — `./data` does not exist yet.

- [ ] **Step 3: Write `lib/graph/data.ts`**

This is a hand-authored dataset about a fictional research program studying a lichen species (`Xanthoria testflora`) — chosen so every node type has a coherent, realistic-sounding home and the cross-links (genome ↔ publication ↔ finding ↔ hypothesis ↔ experiment ↔ dataset ↔ taxon) read the way a real research knowledge graph would.

```ts
// lib/graph/data.ts
import { KnowledgeNode, KnowledgeEdge } from "./types";

export const KNOWLEDGE_NODES: KnowledgeNode[] = [
  // Taxa
  { id: "tax-1", type: "Taxon", label: "Xanthoria testflora", description: "Foliose lichen species used as the primary model organism for this research program's desiccation and UV-resilience studies." },
  { id: "tax-2", type: "Taxon", label: "Xanthoria parietina", description: "Closely related sister species used as a comparative baseline for genomic and physiological studies." },
  { id: "tax-3", type: "Taxon", label: "Teloschistales", description: "Order of lichenized fungi containing Xanthoria and several related genera studied for stress tolerance." },
  { id: "tax-4", type: "Taxon", label: "Lecanoromycetes", description: "Class of lichen-forming fungi encompassing Teloschistales and other orders relevant to phylogenetic comparison." },
  { id: "tax-5", type: "Taxon", label: "Trebouxia sp. TX4", description: "Photosynthetic algal partner isolated from X. testflora thalli, forming the lichen's symbiotic relationship." },
  { id: "tax-6", type: "Taxon", label: "Rhizocarpon geographicum", description: "Distantly related crustose lichen included as an outgroup for phylogenomic comparison." },

  // Genes
  { id: "gene-1", type: "Gene", label: "PKS9", description: "Polyketide synthase gene implicated in pigment and secondary metabolite production." },
  { id: "gene-2", type: "Gene", label: "MEL2", description: "Regulator of melanin biosynthesis, hypothesized to contribute to UV shielding." },
  { id: "gene-3", type: "Gene", label: "DES1", description: "Desiccation-tolerance gene encoding a dehydrin-family protein central to the lab's stress-response research." },
  { id: "gene-4", type: "Gene", label: "SOD3", description: "Superoxide dismutase gene involved in antioxidant defense during rehydration stress." },
  { id: "gene-5", type: "Gene", label: "PHR1", description: "Photolyase gene responsible for repairing UV-induced DNA damage." },
  { id: "gene-6", type: "Gene", label: "AQP7", description: "Aquaporin gene mediating water transport across cell membranes under variable hydration." },
  { id: "gene-7", type: "Gene", label: "HSP70L", description: "Heat shock protein gene induced during combined heat and desiccation stress." },

  // Proteins
  { id: "prot-1", type: "Protein", label: "PKS9 synthase", description: "Enzyme encoded by PKS9 catalyzing polyketide pigment synthesis." },
  { id: "prot-2", type: "Protein", label: "DES1 dehydrin", description: "Stress-protective protein that accumulates rapidly during desiccation." },
  { id: "prot-3", type: "Protein", label: "SOD3 enzyme", description: "Antioxidant enzyme that scavenges reactive oxygen species during rehydration." },
  { id: "prot-4", type: "Protein", label: "PHR1 photolyase", description: "DNA repair enzyme activated by blue light to reverse UV-induced lesions." },
  { id: "prot-5", type: "Protein", label: "AQP7 channel", description: "Membrane channel protein regulating rapid water flux during hydration cycles." },

  // Experiments
  { id: "exp-1", type: "Experiment", label: "Desiccation Tolerance Assay 2023", description: "Controlled dehydration-rehydration cycling of thalli to measure stress gene expression." },
  { id: "exp-2", type: "Experiment", label: "UV-B Exposure Trial", description: "Chamber-based UV-B irradiation of specimens to assess photodamage and repair response." },
  { id: "exp-3", type: "Experiment", label: "Symbiont Co-culture Experiment", description: "Paired culturing of fungal and algal partners to study symbiosis-driven stress responses." },
  { id: "exp-4", type: "Experiment", label: "Field Transplant Study — Alpine Site", description: "Reciprocal transplant of thalli between lowland and alpine sites to test acclimation." },
  { id: "exp-5", type: "Experiment", label: "Comparative Genome Sequencing Run", description: "Whole-genome sequencing run comparing X. testflora against related taxa." },
  { id: "exp-6", type: "Experiment", label: "Rehydration Proteomics Panel", description: "Time-resolved proteomic sampling across a rehydration event." },

  // Methods
  { id: "method-1", type: "Method", label: "RNA-seq Differential Expression", description: "Transcriptomic method quantifying gene expression changes across treatment conditions." },
  { id: "method-2", type: "Method", label: "Whole Genome Shotgun Sequencing", description: "Sequencing method used to assemble reference genomes from fragmented DNA reads." },
  { id: "method-3", type: "Method", label: "Quantitative Proteomics (LC-MS/MS)", description: "Mass spectrometry method for identifying and quantifying protein abundance." },
  { id: "method-4", type: "Method", label: "Controlled Environment Chamber Assay", description: "Standardized chamber protocol for applying reproducible desiccation and UV treatments." },

  // Hypotheses
  { id: "hyp-1", type: "Hypothesis", label: "Dehydrin accumulation drives desiccation tolerance", description: "Central hypothesis linking DES1 dehydrin levels to survival under water loss." },
  { id: "hyp-2", type: "Hypothesis", label: "Symbiosis modulates host oxidative stress response", description: "Hypothesis that the algal partner's presence alters antioxidant gene activity in the host fungus." },
  { id: "hyp-3", type: "Hypothesis", label: "UV resilience is conserved across Teloschistales", description: "Hypothesis that photoprotective mechanisms are shared broadly across the order, not unique to X. testflora." },

  // Findings
  { id: "find-1", type: "Finding", label: "DES1 expression spikes under desiccation stress", description: "Time-course data show DES1 transcript levels rising sharply within hours of water loss." },
  { id: "find-2", type: "Finding", label: "PHR1 activity correlates with UV tolerance", description: "Specimens with higher PHR1 activity show reduced UV-induced DNA damage." },
  { id: "find-3", type: "Finding", label: "Symbiont co-culture increases SOD3 output", description: "Co-cultured samples show elevated SOD3 enzyme activity relative to fungus-only controls." },
  { id: "find-4", type: "Finding", label: "Alpine population shows elevated AQP7 expression", description: "Field-collected alpine specimens express AQP7 at higher baseline levels than lowland specimens." },
  { id: "find-5", type: "Finding", label: "Genome-wide divergence between species is modest", description: "Comparative sequencing shows X. testflora and X. parietina share high genomic similarity despite habitat differences." },

  // Publications
  { id: "pub-1", type: "Publication", label: "Dehydrin Dynamics in Desert Lichens (2021)", description: "Foundational paper establishing dehydrin accumulation as a key desiccation-tolerance mechanism." },
  { id: "pub-2", type: "Publication", label: "Photoprotection Mechanisms in Lichenized Fungi (2020)", description: "Review of photolyase and pigment-based UV protection strategies in lichen-forming fungi." },
  { id: "pub-3", type: "Publication", label: "Symbiosis and Stress: A Review (2019)", description: "Survey of how fungal-algal symbiosis influences stress tolerance across lichen taxa." },
  { id: "pub-4", type: "Publication", label: "Comparative Genomics of Xanthoria spp. (2023)", description: "Genome-level comparison across Xanthoria species highlighting conserved stress-response loci." },
  { id: "pub-5", type: "Publication", label: "Alpine Lichen Ecophysiology (2022)", description: "Field study of physiological adaptation in lichen populations across elevation gradients." },
  { id: "pub-6", type: "Publication", label: "Water Transport in Poikilohydric Organisms (2018)", description: "Review of aquaporin-mediated water transport in organisms lacking active water regulation." },
  { id: "pub-7", type: "Publication", label: "Reassessing Teloschistales Phylogeny (2024)", description: "Phylogenomic reanalysis proposing revised relationships within the Teloschistales order." },

  // Datasets
  { id: "ds-1", type: "Dataset", label: "X. testflora Reference Genome v2", description: "Second-release assembled and annotated reference genome for the focal species." },
  { id: "ds-2", type: "Dataset", label: "Desiccation Time-Course RNA-seq", description: "Raw and processed RNA-seq reads across the desiccation-rehydration time course." },
  { id: "ds-3", type: "Dataset", label: "Alpine Transplant Field Measurements", description: "Physiological measurements collected from the alpine reciprocal transplant study." },
  { id: "ds-4", type: "Dataset", label: "Proteomics LC-MS/MS Raw Spectra", description: "Raw mass spectrometry spectra from the rehydration proteomics panel." },
  { id: "ds-5", type: "Dataset", label: "Teloschistales Phylogenomic Alignment", description: "Multi-species sequence alignment used for order-level phylogenetic analysis." },

  // Research projects (hubs)
  { id: "proj-1", type: "ResearchProject", label: "Lichen Stress Resilience Program", description: "Umbrella research program coordinating desiccation, UV, and symbiosis stress studies." },
  { id: "proj-2", type: "ResearchProject", label: "Fungal Symbiosis Genomics Initiative", description: "Program focused on genome and dataset production supporting symbiosis and comparative genomics work." },
];

export const KNOWLEDGE_EDGES: KnowledgeEdge[] = [
  // Taxonomy
  { id: "e1", source: "tax-1", target: "tax-3", type: "partOf" },
  { id: "e2", source: "tax-2", target: "tax-3", type: "partOf" },
  { id: "e3", source: "tax-3", target: "tax-4", type: "partOf" },
  { id: "e4", source: "tax-6", target: "tax-4", type: "partOf" },
  { id: "e5", source: "tax-5", target: "tax-1", type: "associatedWith" },
  { id: "e6", source: "tax-2", target: "tax-1", type: "associatedWith" },
  { id: "e7", source: "tax-5", target: "proj-2", type: "associatedWith" },
  { id: "e8", source: "tax-5", target: "hyp-2", type: "associatedWith" },
  { id: "e9", source: "tax-2", target: "find-5", type: "associatedWith" },

  // Genes associated with focal taxon
  { id: "e10", source: "gene-1", target: "tax-1", type: "associatedWith" },
  { id: "e11", source: "gene-2", target: "tax-1", type: "associatedWith" },
  { id: "e12", source: "gene-3", target: "tax-1", type: "associatedWith" },
  { id: "e13", source: "gene-4", target: "tax-1", type: "associatedWith" },
  { id: "e14", source: "gene-5", target: "tax-1", type: "associatedWith" },
  { id: "e15", source: "gene-6", target: "tax-1", type: "associatedWith" },
  { id: "e16", source: "gene-7", target: "tax-1", type: "associatedWith" },

  // Genes produce proteins
  { id: "e17", source: "gene-1", target: "prot-1", type: "produces" },
  { id: "e18", source: "gene-3", target: "prot-2", type: "produces" },
  { id: "e19", source: "gene-4", target: "prot-3", type: "produces" },
  { id: "e20", source: "gene-5", target: "prot-4", type: "produces" },
  { id: "e21", source: "gene-6", target: "prot-5", type: "produces" },

  // DES1 (gene-3) hub edges
  { id: "e22", source: "gene-3", target: "exp-1", type: "associatedWith" },
  { id: "e23", source: "gene-3", target: "exp-6", type: "associatedWith" },
  { id: "e24", source: "gene-3", target: "hyp-1", type: "associatedWith" },
  { id: "e25", source: "gene-3", target: "find-1", type: "associatedWith" },
  { id: "e26", source: "gene-3", target: "proj-1", type: "associatedWith" },
  { id: "e27", source: "gene-3", target: "pub-1", type: "associatedWith" },

  // Experiments associated with focal taxon
  { id: "e28", source: "exp-1", target: "tax-1", type: "associatedWith" },
  { id: "e29", source: "exp-2", target: "tax-1", type: "associatedWith" },
  { id: "e30", source: "exp-3", target: "tax-1", type: "associatedWith" },
  { id: "e31", source: "exp-4", target: "tax-1", type: "associatedWith" },
  { id: "e32", source: "exp-5", target: "tax-1", type: "associatedWith" },
  { id: "e33", source: "exp-6", target: "tax-1", type: "associatedWith" },

  { id: "e34", source: "ds-1", target: "tax-1", type: "derivedFrom" },
  { id: "e35", source: "proj-1", target: "tax-1", type: "associatedWith" },

  // Experiments use methods (sparse cluster)
  { id: "e36", source: "exp-1", target: "method-1", type: "usesMethod" },
  { id: "e37", source: "exp-1", target: "method-4", type: "usesMethod" },
  { id: "e38", source: "exp-2", target: "method-4", type: "usesMethod" },
  { id: "e39", source: "exp-3", target: "method-4", type: "usesMethod" },
  { id: "e40", source: "exp-4", target: "method-1", type: "usesMethod" },
  { id: "e41", source: "exp-5", target: "method-2", type: "usesMethod" },
  { id: "e42", source: "exp-6", target: "method-3", type: "usesMethod" },

  // Experiments derived from hypotheses + cycle closure (exp-1 -> find-1 -> hyp-1 -> exp-1)
  { id: "e43", source: "exp-1", target: "hyp-1", type: "derivedFrom" },
  { id: "e44", source: "exp-2", target: "hyp-3", type: "derivedFrom" },
  { id: "e45", source: "exp-3", target: "hyp-2", type: "derivedFrom" },
  { id: "e46", source: "hyp-1", target: "exp-1", type: "associatedWith" },

  // Experiments produce findings
  { id: "e47", source: "exp-1", target: "find-1", type: "produces" },
  { id: "e48", source: "find-1", target: "hyp-1", type: "supports" },
  { id: "e49", source: "exp-2", target: "find-2", type: "produces" },
  { id: "e50", source: "exp-3", target: "find-3", type: "produces" },
  { id: "e51", source: "exp-4", target: "find-4", type: "produces" },
  { id: "e52", source: "exp-5", target: "find-5", type: "produces" },
  { id: "e53", source: "exp-6", target: "find-3", type: "produces" },

  // Findings support/contradict hypotheses
  { id: "e54", source: "find-2", target: "hyp-3", type: "supports" },
  { id: "e55", source: "find-3", target: "hyp-2", type: "supports" },
  { id: "e56", source: "find-4", target: "hyp-1", type: "supports" },
  { id: "e57", source: "find-5", target: "hyp-3", type: "supports" },

  // Experiments produce datasets
  { id: "e58", source: "exp-5", target: "ds-1", type: "produces" },
  { id: "e59", source: "exp-1", target: "ds-2", type: "produces" },
  { id: "e60", source: "exp-4", target: "ds-3", type: "produces" },
  { id: "e61", source: "exp-6", target: "ds-4", type: "produces" },
  { id: "e62", source: "exp-5", target: "ds-5", type: "produces" },

  // Long-distance cross-branch links from ds-5
  { id: "e63", source: "ds-5", target: "tax-6", type: "associatedWith" },
  { id: "e64", source: "ds-5", target: "tax-4", type: "associatedWith" },
  { id: "e65", source: "ds-5", target: "pub-7", type: "associatedWith" },

  // Publication citation cycle + hub (pub-1)
  { id: "e66", source: "pub-1", target: "pub-2", type: "cites" },
  { id: "e67", source: "pub-2", target: "pub-3", type: "cites" },
  { id: "e68", source: "pub-3", target: "pub-1", type: "cites" },
  { id: "e69", source: "pub-4", target: "pub-1", type: "cites" },
  { id: "e70", source: "pub-5", target: "pub-1", type: "cites" },
  { id: "e71", source: "pub-6", target: "pub-1", type: "cites" },
  { id: "e72", source: "pub-7", target: "pub-1", type: "cites" },

  // Publications derived from findings
  { id: "e73", source: "pub-1", target: "find-1", type: "derivedFrom" },
  { id: "e74", source: "pub-2", target: "find-2", type: "derivedFrom" },
  { id: "e75", source: "pub-3", target: "find-3", type: "derivedFrom" },
  { id: "e76", source: "pub-4", target: "find-5", type: "derivedFrom" },
  { id: "e77", source: "pub-5", target: "find-4", type: "derivedFrom" },

  // Long-distance cross-branch links from publications
  { id: "e78", source: "pub-6", target: "gene-6", type: "associatedWith" },
  { id: "e79", source: "pub-7", target: "tax-3", type: "associatedWith" },
  { id: "e80", source: "pub-7", target: "tax-4", type: "associatedWith" },

  // Research project hubs
  { id: "e81", source: "proj-1", target: "hyp-1", type: "associatedWith" },
  { id: "e82", source: "proj-1", target: "hyp-2", type: "associatedWith" },
  { id: "e83", source: "proj-1", target: "hyp-3", type: "associatedWith" },
  { id: "e84", source: "proj-1", target: "exp-1", type: "associatedWith" },
  { id: "e85", source: "proj-1", target: "exp-2", type: "associatedWith" },
  { id: "e86", source: "proj-1", target: "exp-3", type: "associatedWith" },
  { id: "e87", source: "proj-1", target: "exp-4", type: "associatedWith" },
  { id: "e88", source: "proj-2", target: "ds-1", type: "associatedWith" },
  { id: "e89", source: "proj-2", target: "ds-2", type: "associatedWith" },
  { id: "e90", source: "proj-2", target: "ds-4", type: "associatedWith" },
  { id: "e91", source: "proj-2", target: "ds-5", type: "associatedWith" },
  { id: "e92", source: "proj-2", target: "exp-5", type: "associatedWith" },
  { id: "e93", source: "proj-2", target: "exp-6", type: "associatedWith" },
  { id: "e94", source: "proj-2", target: "pub-4", type: "associatedWith" },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/graph/data.test.ts`
Expected: PASS (7 tests). `tax-1` (degree 18) and `gene-3` (degree 8) satisfy the hub check; `tax-6`, `method-2`, `method-3` etc. satisfy the sparse check; the `pub-1→pub-2→pub-3→pub-1` and `exp-1→find-1→hyp-1→exp-1` cycles satisfy the cycle check.

- [ ] **Step 5: Commit**

```bash
git add lib/graph/data.ts lib/graph/data.test.ts
git commit -m "feat: add hand-authored 50-node scientific knowledge graph dataset"
```

---

## Task 4: Layout engine interfaces + ELK conversion module

**Files:**
- Create: `lib/layout/types.ts`
- Create: `lib/layout/elk/convert.ts`
- Test: `lib/layout/elk/convert.test.ts`
- Modify: `package.json` (add `elkjs` dependency)

**Interfaces:**
- Consumes: `KnowledgeNode`, `KnowledgeEdge` from `lib/graph/types.ts`.
- Produces: `Size`, `LayoutOptions`, `PositionedNode`, `PositionedEdge`, `LayoutResult`, `LayoutEngine` (all in `lib/layout/types.ts`); `toElkGraph`, `fromElkResult`, `runElk` (in `lib/layout/elk/convert.ts`).

- [ ] **Step 1: Install elkjs**

```bash
pnpm add elkjs
```

- [ ] **Step 2: Write `lib/layout/types.ts`**

```ts
// lib/layout/types.ts
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";

export interface Size {
  width: number;
  height: number;
}

export interface LayoutOptions {
  direction: "DOWN" | "UP" | "RIGHT" | "LEFT";
  spacing: { node: number; layer: number; edge: number; component: number };
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutedPoint {
  x: number;
  y: number;
}

export interface PositionedEdge {
  id: string;
  points?: RoutedPoint[];
}

export interface LayoutResult {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
}

export interface LayoutEngine {
  id: string;
  label: string;
  computeLayout(
    nodes: KnowledgeNode[],
    edges: KnowledgeEdge[],
    measuredSizes: Record<string, Size>,
    options: LayoutOptions
  ): Promise<LayoutResult>;
}

export const DEFAULT_NODE_SIZE: Size = { width: 220, height: 96 };
```

- [ ] **Step 3: Write the failing test for the conversion module**

```ts
// lib/layout/elk/convert.test.ts
import { describe, it, expect } from "vitest";
import { toElkGraph, fromElkResult, runElk } from "./convert";
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";

const nodes: KnowledgeNode[] = [
  { id: "a", type: "Gene", label: "A", description: "" },
  { id: "b", type: "Gene", label: "B", description: "" },
  { id: "c", type: "Gene", label: "C", description: "" },
];
const edges: KnowledgeEdge[] = [
  { id: "e1", source: "a", target: "b", type: "associatedWith" },
  { id: "e2", source: "b", target: "c", type: "associatedWith" },
];
const sizes = {
  a: { width: 200, height: 80 },
  b: { width: 200, height: 80 },
  c: { width: 200, height: 80 },
};

describe("toElkGraph", () => {
  it("maps nodes and edges into ELK's expected shape, using measured sizes", () => {
    const graph = toElkGraph(nodes, edges, sizes, { "elk.algorithm": "org.eclipse.elk.layered" });
    expect(graph.children).toHaveLength(3);
    expect(graph.children?.[0]).toMatchObject({ id: "a", width: 200, height: 80 });
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges?.[0]).toMatchObject({ id: "e1", sources: ["a"], targets: ["b"] });
  });

  it("falls back to a default size for unmeasured nodes", () => {
    const graph = toElkGraph(nodes, edges, {}, { "elk.algorithm": "org.eclipse.elk.layered" });
    expect(graph.children?.[0].width).toBeGreaterThan(0);
    expect(graph.children?.[0].height).toBeGreaterThan(0);
  });
});

describe("fromElkResult", () => {
  it("maps ELK's positioned output back into PositionedNode/PositionedEdge", () => {
    const elkResult = {
      id: "root",
      children: [{ id: "a", x: 10, y: 20, width: 200, height: 80 }],
      edges: [
        {
          id: "e1",
          sections: [
            { startPoint: { x: 10, y: 20 }, bendPoints: [{ x: 50, y: 30 }], endPoint: { x: 90, y: 40 } },
          ],
        },
      ],
    };
    const result = fromElkResult(elkResult);
    expect(result.nodes[0]).toEqual({ id: "a", x: 10, y: 20, width: 200, height: 80 });
    expect(result.edges[0].points).toEqual([
      { x: 10, y: 20 },
      { x: 50, y: 30 },
      { x: 90, y: 40 },
    ]);
  });
});

describe("runElk", () => {
  it("actually lays out a small graph with real elkjs, producing finite, distinct positions", async () => {
    const result = await runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.layered",
      "elk.direction": "DOWN",
    });
    expect(result.nodes).toHaveLength(3);
    for (const n of result.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
    const positions = result.nodes.map((n) => `${n.x},${n.y}`);
    expect(new Set(positions).size).toBe(positions.length);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm test lib/layout/elk/convert.test.ts`
Expected: FAIL — `./convert` does not exist yet.

- [ ] **Step 5: Write `lib/layout/elk/convert.ts`**

```ts
// lib/layout/elk/convert.ts
import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutResult, PositionedEdge, PositionedNode, Size, DEFAULT_NODE_SIZE } from "@/lib/layout/types";

export function toElkGraph(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  sizes: Record<string, Size>,
  layoutOptions: Record<string, string>
): ElkNode {
  return {
    id: "root",
    layoutOptions,
    children: nodes.map((n) => ({
      id: n.id,
      width: sizes[n.id]?.width ?? DEFAULT_NODE_SIZE.width,
      height: sizes[n.id]?.height ?? DEFAULT_NODE_SIZE.height,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
}

export function fromElkResult(result: ElkNode): LayoutResult {
  const nodes: PositionedNode[] = (result.children ?? []).map((c) => ({
    id: c.id,
    x: c.x ?? 0,
    y: c.y ?? 0,
    width: c.width ?? DEFAULT_NODE_SIZE.width,
    height: c.height ?? DEFAULT_NODE_SIZE.height,
  }));

  const edges: PositionedEdge[] = (result.edges ?? []).map((e) => {
    const section = (e.sections ?? [])[0];
    if (!section) return { id: e.id as string };
    const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
    return { id: e.id as string, points };
  });

  return { nodes, edges };
}

export async function runElk(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  sizes: Record<string, Size>,
  layoutOptions: Record<string, string>
): Promise<LayoutResult> {
  const elk = new ELK();
  const graph = toElkGraph(nodes, edges, sizes, layoutOptions);
  const layouted = await elk.layout(graph);
  return fromElkResult(layouted);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test lib/layout/elk/convert.test.ts`
Expected: PASS (4 tests). If `runElk`'s test fails because elkjs rejects an option key, check the exact option name against the ELK reference (via context7 for `elkjs`/Eclipse Layout Kernel docs) and correct the key in `convert.test.ts`'s `layoutOptions` — this is a spot to actually debug, not to loosen the assertion.

- [ ] **Step 7: Commit**

```bash
git add lib/layout/types.ts lib/layout/elk/convert.ts lib/layout/elk/convert.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add layout engine interfaces and ELK graph conversion"
```

---

## Task 5: ELK Layered/Force/Radial engines + registry

**Files:**
- Create: `lib/layout/elk/layered.ts`
- Create: `lib/layout/elk/force.ts`
- Create: `lib/layout/elk/radial.ts`
- Create: `lib/layout/registry.ts`
- Test: `lib/layout/registry.test.ts`

**Interfaces:**
- Consumes: `runElk` from `lib/layout/elk/convert.ts`; `LayoutEngine`, `LayoutOptions`, `Size` from `lib/layout/types.ts`.
- Produces: `elkLayeredEngine`, `elkForceEngine`, `elkRadialEngine` (each a `LayoutEngine`); `LAYOUT_ENGINES: Record<string, LayoutEngine>`, `DEFAULT_LAYOUT_ENGINE_ID: string` in `lib/layout/registry.ts`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/layout/registry.test.ts
import { describe, it, expect } from "vitest";
import { LAYOUT_ENGINES, DEFAULT_LAYOUT_ENGINE_ID } from "./registry";
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";

const nodes: KnowledgeNode[] = ["a", "b", "c", "d"].map((id) => ({
  id,
  type: "Gene",
  label: id,
  description: "",
}));
const edges: KnowledgeEdge[] = [
  { id: "e1", source: "a", target: "b", type: "associatedWith" },
  { id: "e2", source: "b", target: "c", type: "associatedWith" },
  { id: "e3", source: "a", target: "d", type: "associatedWith" },
];
const sizes = Object.fromEntries(nodes.map((n) => [n.id, { width: 200, height: 80 }]));
const options = { direction: "DOWN" as const, spacing: { node: 40, layer: 60, edge: 20, component: 60 } };

describe("layout engine registry", () => {
  it("registers elk-layered, elk-force, and elk-radial", () => {
    expect(Object.keys(LAYOUT_ENGINES).sort()).toEqual(["elk-force", "elk-layered", "elk-radial"]);
    expect(LAYOUT_ENGINES[DEFAULT_LAYOUT_ENGINE_ID]).toBeDefined();
  });

  it.each(["elk-layered", "elk-force", "elk-radial"])(
    "%s positions every node with a finite x/y",
    async (id) => {
      const result = await LAYOUT_ENGINES[id].computeLayout(nodes, edges, sizes, options);
      expect(result.nodes).toHaveLength(4);
      for (const n of result.nodes) {
        expect(Number.isFinite(n.x)).toBe(true);
        expect(Number.isFinite(n.y)).toBe(true);
      }
    }
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/layout/registry.test.ts`
Expected: FAIL — `./registry` does not exist yet.

- [ ] **Step 3: Write the three engine files**

```ts
// lib/layout/elk/layered.ts
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutEngine, LayoutOptions, Size } from "@/lib/layout/types";
import { runElk } from "./convert";

export const elkLayeredEngine: LayoutEngine = {
  id: "elk-layered",
  label: "ELK Layered",
  computeLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], sizes: Record<string, Size>, options: LayoutOptions) {
    return runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.layered",
      "elk.direction": options.direction,
      "elk.spacing.nodeNode": String(options.spacing.node),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(options.spacing.layer),
      "elk.spacing.edgeNode": String(options.spacing.edge),
      "elk.spacing.componentComponent": String(options.spacing.component),
      "elk.edgeRouting": "ORTHOGONAL",
    });
  },
};
```

```ts
// lib/layout/elk/force.ts
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutEngine, LayoutOptions, Size } from "@/lib/layout/types";
import { runElk } from "./convert";

export const elkForceEngine: LayoutEngine = {
  id: "elk-force",
  label: "ELK Force",
  computeLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], sizes: Record<string, Size>, options: LayoutOptions) {
    return runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.force",
      "elk.spacing.nodeNode": String(options.spacing.node),
      "elk.spacing.componentComponent": String(options.spacing.component),
      "org.eclipse.elk.force.iterations": "300",
    });
  },
};
```

```ts
// lib/layout/elk/radial.ts
import { KnowledgeNode, KnowledgeEdge } from "@/lib/graph/types";
import { LayoutEngine, LayoutOptions, Size } from "@/lib/layout/types";
import { runElk } from "./convert";

export const elkRadialEngine: LayoutEngine = {
  id: "elk-radial",
  label: "ELK Radial",
  computeLayout(nodes: KnowledgeNode[], edges: KnowledgeEdge[], sizes: Record<string, Size>, options: LayoutOptions) {
    return runElk(nodes, edges, sizes, {
      "elk.algorithm": "org.eclipse.elk.radial",
      "elk.spacing.nodeNode": String(options.spacing.node),
      "elk.spacing.componentComponent": String(options.spacing.component),
    });
  },
};
```

- [ ] **Step 4: Write `lib/layout/registry.ts`**

```ts
// lib/layout/registry.ts
import { LayoutEngine } from "./types";
import { elkLayeredEngine } from "./elk/layered";
import { elkForceEngine } from "./elk/force";
import { elkRadialEngine } from "./elk/radial";

export const LAYOUT_ENGINES: Record<string, LayoutEngine> = {
  [elkLayeredEngine.id]: elkLayeredEngine,
  [elkForceEngine.id]: elkForceEngine,
  [elkRadialEngine.id]: elkRadialEngine,
};

export const DEFAULT_LAYOUT_ENGINE_ID = elkLayeredEngine.id;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test lib/layout/registry.test.ts`
Expected: PASS (4 tests — 1 registration check + 3 parametrized engine checks). Debug any per-engine failures the same way as Task 4's note (verify option keys against ELK's reference docs, don't loosen assertions).

- [ ] **Step 6: Commit**

```bash
git add lib/layout/elk/layered.ts lib/layout/elk/force.ts lib/layout/elk/radial.ts lib/layout/registry.ts lib/layout/registry.test.ts
git commit -m "feat: register ELK Layered, Force, and Radial layout engines"
```

---
