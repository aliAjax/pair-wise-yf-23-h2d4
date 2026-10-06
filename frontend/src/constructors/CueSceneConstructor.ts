import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "",
  fixture_states: [],
  fade_in_ms: 0,
  hold_ms: 0,
  priority: 0,
  scene_status: "DRAFT",
  stale: false,
  recalculating: false,
  last_recalculated_at: "",
  version: 1,
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
