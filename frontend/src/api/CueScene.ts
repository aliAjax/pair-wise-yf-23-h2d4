import { mockData } from "../mocks/seedData";
import type { CueScene, LegacyCueScene } from "../types/CueScene";
import { backfillCueScenes } from "../utils/backfill";
import {
  invalidateScenesForFixture,
  recalculateStaleScenes,
  isAnySceneRecalculating,
  hasStaleScenes
} from "../services/sceneService";
import type { Fixture } from "../types/Fixture";

const endpoint = "/api/cue-scene";

/**
 * 列出场景。旧数据的 fixture_states 是字符串，加载时回填。
 */
export async function listCueScene(): Promise<CueScene[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const raw = mockData.cueScene as unknown as LegacyCueScene[];
  return backfillCueScenes(raw);
}

export async function saveCueScene(payload: CueScene): Promise<CueScene> {
  console.info("save CueScene", payload);
  return payload;
}

/**
 * 灯具通道模式变更后，作废引用它的场景。
 */
export async function invalidateScenesForFixtureChange(
  scenes: CueScene[],
  fixtureId: number
): Promise<CueScene[]> {
  return invalidateScenesForFixture(scenes, fixtureId);
}

/**
 * 重算所有作废场景。
 */
export async function recalculateAllStaleScenes(
  scenes: CueScene[],
  fixtures: Fixture[]
): Promise<CueScene[]> {
  return recalculateStaleScenes(scenes, fixtures);
}

export { isAnySceneRecalculating, hasStaleScenes };
