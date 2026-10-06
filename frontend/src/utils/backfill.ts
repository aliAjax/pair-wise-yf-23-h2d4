import type { Fixture, LegacyFixture } from "../types/Fixture";
import type { CueScene, LegacyCueScene, FixtureChannelState } from "../types/CueScene";
import type { ChannelMode } from "../types/ChannelMode";
import { ChannelModeChannelCount } from "../constants/ChannelMode";

/**
 * 按原来的通道数回填通道模式：
 * - 1 通道 -> DIMMER_ONLY
 * - 3 通道 -> RGB
 * - 4 通道 -> RGBW
 * - 其余 -> MOVING_HEAD
 */
export function inferChannelMode(channelCount: number): ChannelMode {
  if (channelCount === ChannelModeChannelCount.DIMMER_ONLY) return "DIMMER_ONLY";
  if (channelCount === ChannelModeChannelCount.RGB) return "RGB";
  if (channelCount === ChannelModeChannelCount.RGBW) return "RGBW";
  return "MOVING_HEAD";
}

function toNumber(value: string | number, fallback: number): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * 回填旧版灯具数据：补 channel_mode / universe / dmx_address_locked / version，
 * 并把 dmx_address / channel_count 转为数字。
 */
export function backfillFixture(raw: LegacyFixture): Fixture {
  const channelCount = toNumber(raw.channel_count, ChannelModeChannelCount.RGB);
  const dmxAddress = toNumber(raw.dmx_address, 1);
  return {
    id: raw.id,
    fixture_code: raw.fixture_code,
    fixture_type: raw.fixture_type,
    position_x: raw.position_x,
    position_y: raw.position_y,
    dmx_address: dmxAddress,
    universe: 1,
    channel_count: channelCount,
    channel_mode: inferChannelMode(channelCount),
    color_mode: raw.color_mode,
    dmx_address_locked: false,
    version: 1
  };
}

/**
 * 批量回填旧版灯具数据。
 */
export function backfillFixtures(raws: LegacyFixture[]): Fixture[] {
  return raws.map(backfillFixture);
}

/**
 * 解析旧版场景的 fixture_states：可能是字符串（旧版）或结构化数组。
 * 字符串格式形如 "fixture states 1"，无法解析时返回空数组。
 */
function parseFixtureStates(raw: string | FixtureChannelState[]): FixtureChannelState[] {
  if (Array.isArray(raw)) return raw;
  // 旧版字符串无法解析出通道状态，返回空数组
  return [];
}

/**
 * 回填旧版场景数据：补 stale / recalculating / last_recalculated_at / version，
 * 并把 fade_in_ms / hold_ms / priority 转为数字。
 */
export function backfillCueScene(raw: LegacyCueScene): CueScene {
  return {
    id: raw.id,
    name: raw.name,
    fixture_states: parseFixtureStates(raw.fixture_states),
    fade_in_ms: toNumber(raw.fade_in_ms, 0),
    hold_ms: toNumber(raw.hold_ms, 0),
    priority: toNumber(raw.priority, 0),
    scene_status: raw.scene_status,
    stale: false,
    recalculating: false,
    last_recalculated_at: "",
    version: 1
  };
}

/**
 * 批量回填旧版场景数据。
 */
export function backfillCueScenes(raws: LegacyCueScene[]): CueScene[] {
  return raws.map(backfillCueScene);
}
