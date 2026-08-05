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
