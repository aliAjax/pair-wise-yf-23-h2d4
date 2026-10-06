import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import { ChannelModeChannelNames } from "../constants/ChannelMode";
import { LOG_TEMPLATES } from "../constants/logTemplates";

/**
 * 判断场景是否引用了指定灯具。
 */
export function sceneReferencesFixture(scene: CueScene, fixtureId: number): boolean {
  return scene.fixture_states.some((s) => s.fixture_id === fixtureId);
}

/**
 * 灯具通道模式变更后，标记引用它的场景为作废（stale）。
 * 返回更新后的场景列表。
 */
export function invalidateScenesForFixture(scenes: CueScene[], fixtureId: number): CueScene[] {
  const invalidated: CueScene[] = [];
  const result = scenes.map((scene) => {
    if (sceneReferencesFixture(scene, fixtureId)) {
      invalidated.push(scene);
      console.info(`[${LOG_TEMPLATES.CueScene[4]}]`, {
        sceneId: scene.id,
        sceneName: scene.name,
        fixtureId
      });
      return { ...scene, stale: true, recalculating: false };
    }
    return scene;
  });
  return result;
}

/**
 * 重算场景：根据灯具的通道模式重新生成通道状态结构。
 * 模拟异步耗时计算。
 */
export async function recalculateScene(scene: CueScene, fixtures: Fixture[]): Promise<CueScene> {
  console.info(`[${LOG_TEMPLATES.CueScene[5]}]`, { sceneId: scene.id });
  // 模拟耗时计算
  await new Promise((resolve) => setTimeout(resolve, 300));

  const fixtureMap = new Map(fixtures.map((f) => [f.id, f]));
  const recalculatedStates = scene.fixture_states.map((state) => {
    const fixture = fixtureMap.get(state.fixture_id);
    if (!fixture) return state;
    const channelNames = ChannelModeChannelNames[fixture.channel_mode] ?? [];
    const channels: Record<string, number> = {};
    for (const name of channelNames) {
      channels[name] = state.channels[name] ?? 0;
    }
    return { ...state, channels };
  });

  const now = new Date().toISOString();
  console.info(`[${LOG_TEMPLATES.CueScene[6]}]`, { sceneId: scene.id });
  return {
    ...scene,
    fixture_states: recalculatedStates,
    stale: false,
    recalculating: false,
    last_recalculated_at: now,
    version: scene.version + 1
  };
}

/**
 * 批量重算所有作废场景。
 */
export async function recalculateStaleScenes(
  scenes: CueScene[],
  fixtures: Fixture[]
): Promise<CueScene[]> {
  const result = [...scenes];
  for (let i = 0; i < result.length; i += 1) {
    if (result[i].stale) {
      result[i] = await recalculateScene(result[i], fixtures);
    }
  }
  return result;
}

/**
 * 检查是否有场景正在重算（舞台预览不得播放）。
 */
export function isAnySceneRecalculating(scenes: CueScene[]): boolean {
  return scenes.some((s) => s.recalculating);
}

/**
 * 检查是否有场景作废未重算。
 */
export function hasStaleScenes(scenes: CueScene[]): boolean {
  return scenes.some((s) => s.stale);
}
