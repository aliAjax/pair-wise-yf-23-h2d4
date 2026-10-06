import { create } from "zustand";
import { listCueScene, recalculateAllStaleScenes } from "../api/CueScene";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import { invalidateScenesForFixture } from "../services/sceneService";
import { eventBus, FIXTURE_CHANNEL_MODE_CHANGED } from "../utils/eventBus";

type State = {
  rows: CueScene[];
  loading: boolean;
  recalculating: boolean;
  load: () => Promise<void>;
  invalidateForFixture: (fixtureId: number) => void;
  recalculateStale: (fixtures: Fixture[]) => Promise<void>;
  hasStale: () => boolean;
};

export const useCueSceneStore = create<State>((set, get) => {
  // 灯具通道模式变更 -> 作废引用它的场景
  eventBus.on<{ fixtureId: number }>(FIXTURE_CHANNEL_MODE_CHANGED, ({ fixtureId }) => {
    const updated = invalidateScenesForFixture(get().rows, fixtureId);
    set({ rows: updated });
  });

  return {
    rows: [],
    loading: false,
    recalculating: false,

    async load() {
      set({ loading: true });
      const rows = await listCueScene();
      set({ rows, loading: false });
    },

    invalidateForFixture(fixtureId) {
      const updated = invalidateScenesForFixture(get().rows, fixtureId);
      set({ rows: updated });
    },

    async recalculateStale(fixtures) {
      set({ recalculating: true });
      const updated = await recalculateAllStaleScenes(get().rows, fixtures);
      set({ rows: updated, recalculating: false });
    },

    hasStale() {
      return get().rows.some((s) => s.stale);
    }
  };
});
