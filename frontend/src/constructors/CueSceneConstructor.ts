import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "",
  fixture_ids: [],
  fixture_states: "{}",
  fade_in_ms: 500,
  hold_ms: 2000,
  priority: 0,
  scene_status: "DRAFT",
  invalidated_by_fixture: null,
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
