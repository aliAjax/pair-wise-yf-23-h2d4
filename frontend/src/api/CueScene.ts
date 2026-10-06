import { mockData } from "../mocks/seedData";
import type { CueScene } from "../types/CueScene";

const endpoint = "/api/cue-scene";
/** 重算耗时：模拟场景按新通道数重新生成通道指令 */
const RECALCULATE_DELAY_MS = 1600;

export async function listCueScene(): Promise<CueScene[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.cueScene as unknown as CueScene[])];
}

export async function saveCueScene(payload: CueScene) {
  console.info("save CueScene", payload);
  return payload;
}

/**
 * 灯具通道模式改动后重算场景通道指令。
 * 未 await 完成前，场景保持 RECALCULATING，舞台预览不跟着播。
 */
export async function recalculateScene(scene: CueScene): Promise<CueScene> {
  await new Promise((resolve) => setTimeout(resolve, RECALCULATE_DELAY_MS));
  return {
    ...scene,
    scene_status: "READY",
    invalidated_by_fixture: null
  };
}
