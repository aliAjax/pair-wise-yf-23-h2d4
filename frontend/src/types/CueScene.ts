/**
 * 场景中单个灯具的状态：通道名 -> 通道值（0-255）
 */
export interface FixtureChannelState {
  fixture_id: number;
  channels: Record<string, number>;
}

export interface CueScene {
  id: number;
  name: string;
  fixture_states: FixtureChannelState[];
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  scene_status: string;
  /** 通道模式变更后标记为 true，等待重算 */
  stale: boolean;
  /** 重算进行中为 true，舞台预览不得播放 */
  recalculating: boolean;
  /** 最近一次重算完成时间 ISO 字符串 */
  last_recalculated_at: string;
  version: number;
}

/**
 * 旧版场景数据：fixture_states 是字符串，没有 stale / recalculating 等字段。
 */
export interface LegacyCueScene {
  id: number;
  name: string;
  fixture_states: string | FixtureChannelState[];
  fade_in_ms: string | number;
  hold_ms: string | number;
  priority: string | number;
  scene_status: string;
}
