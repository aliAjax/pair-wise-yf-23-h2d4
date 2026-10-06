import type { CueStatus } from "./CueStatus";

/**
 * 通道模式改变时，引用了该灯具的场景立即作废（OUTDATED）并重算，
 * 重算期间为 RECALCULATING，完成后回到 READY；未重算完舞台预览不播放。
 */
export interface CueScene {
  id: number;
  name: string;
  /** 引用的灯具 id 列表 */
  fixture_ids: number[];
  /** fixtureId -> 通道值表，JSON 字符串 */
  fixture_states: string;
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  scene_status: CueStatus;
  /** 最近一次使其作废的灯具 id（审计用） */
  invalidated_by_fixture: number | null;
}
