/**
 * Data contract for the temporary "Paper & Prototype Viewer" demo feature.
 * `prototypes` is a dynamic array — a paper may have any number of prototype payloads.
 */
export interface PrototypePayload {
  id: string;
  name: string;
  description?: string;
  /** Shaped like CustomGraphData ({ nodes, edges }); validated via parseCustomGraphJson at selection time. */
  payload: unknown;
}

export interface Paper {
  id: string;
  title: string;
  /** External link to the paper, if available. */
  paperUrl?: string;
  /** Path to a locally-hosted PDF, e.g. "/mollusca/13_....pdf". */
  pdf?: string;
  prototypes: PrototypePayload[];
}
