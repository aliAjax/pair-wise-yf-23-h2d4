import { create } from "zustand";
import { listCueScene, recalculateScene } from "../api/CueScene";
import type { CueScene } from "../types/CueScene";

interface RecalcLogEntry {
  at: string;
  sceneName: string;
  fixtureId: number;
  done: boolean;
}

type State = {
  rows: CueScene[];
  loading: boolean;
  /** 是否存在尚未算完的场景：舞台预览据此禁止播放 */
  recalculating: boolean;
  logs: RecalcLogEntry[];
  load: () => Promise<void>;
  /** 灯具通道模式改动：引用它的场景立即作废并逐个重算 */
  invalidateByFixture: (fixtureId: number, fixtureCode: string) => number[];
  isRecalculatingScene: (sceneId: number) => boolean;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  recalculating: false,
  logs: [],

  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },

  invalidateByFixture(fixtureId: number, fixtureCode: string) {
    const affected = get().rows.filter((scene) => scene.fixture_ids.includes(fixtureId));
    if (affected.length === 0) return [];

    const affectedIds = new Set(affected.map((scene) => scene.id));
    set((state) => ({
      recalculating: true,
      logs: [
        ...affected.map((scene) => ({
          at: new Date().toISOString(),
          sceneName: scene.name,
          fixtureId,
          done: false
        })),
        ...state.logs
      ],
      rows: state.rows.map((scene) =>
        affectedIds.has(scene.id)
          ? { ...scene, scene_status: "OUTDATED", invalidated_by_fixture: fixtureId }
          : scene
      )
    }));

    // 依次重算：OUTDATED → RECALCULATING → READY；没算完 recalculating 不解除
    void (async () => {
      for (const sceneId of affectedIds) {
        set((state) => ({
          rows: state.rows.map((scene) =>
            scene.id === sceneId ? { ...scene, scene_status: "RECALCULATING" } : scene
          )
        }));
        const target = get().rows.find((scene) => scene.id === sceneId);
        if (!target) continue;
        const recalculated = await recalculateScene(target);
        set((state) => ({
          rows: state.rows.map((scene) => (scene.id === sceneId ? recalculated : scene)),
          logs: state.logs.map((entry) =>
            entry.sceneName === target.name && entry.fixtureId === fixtureId && !entry.done
              ? { ...entry, done: true }
              : entry
          )
        }));
      }
      const stillBusy = get().rows.some(
        (scene) => scene.scene_status === "OUTDATED" || scene.scene_status === "RECALCULATING"
      );
      set({ recalculating: stillBusy });
      console.info(`引用灯具 ${fixtureCode} 的场景重算完成`);
    })();

    return Array.from(affectedIds);
  },

  isRecalculatingScene(sceneId: number) {
    const scene = get().rows.find((item) => item.id === sceneId);
    return scene?.scene_status === "OUTDATED" || scene?.scene_status === "RECALCULATING";
  }
}));
