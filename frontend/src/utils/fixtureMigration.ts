import type { Fixture } from "../types/Fixture";
import { ChannelMode, type ChannelMode as ChannelModeType, ChannelModeChannels } from "../constants/ChannelMode";
import { DMX_MAX_UNIVERSES, FIXTURE_SCHEMA_VERSION_LEGACY } from "../constants/Dmx";

/**
 * 旧数据升级：老版本灯具没有 channel_mode 字段，
 * 升级时按原来的 channel_count 反查通道模式回填，找不到精确匹配则按容量就近归档。
 * 不改动原来的 channel_count（“按原来的通道数回填”）。
 */
export function migrateFixture(raw: Record<string, unknown>): Fixture {
  const channelCount = toPositiveInt(raw.channel_count, 1);
  const hasMode = typeof raw.channel_mode === "string"
    && (ChannelMode as readonly string[]).includes(raw.channel_mode);
  const channelMode: ChannelModeType = hasMode
    ? raw.channel_mode as ChannelModeType
    : inferChannelModeByCount(channelCount);

  const universe = toIntOrNull(raw.dmx_universe);
  const address = toIntOrNull(raw.dmx_address);
  const validUniverse = universe !== null && universe >= 1 && universe <= DMX_MAX_UNIVERSES
    ? universe
    : null;

  return {
    id: toPositiveInt(raw.id, 0),
    fixture_code: String(raw.fixture_code ?? `FIX-${toPositiveInt(raw.id, 0)}`),
    fixture_type: String(raw.fixture_type ?? "PAR"),
    position_x: toNumber(raw.position_x, 0),
    position_y: toNumber(raw.position_y, 0),
    dmx_universe: validUniverse,
    dmx_address: address,
    channel_count: channelCount,
    channel_mode: channelMode,
    address_locked: raw.address_locked === true,
    mode_version: toPositiveInt(raw.mode_version, 1)
  };
}

export function isLegacyFixture(raw: Record<string, unknown>): boolean {
  return raw.__schema_version === FIXTURE_SCHEMA_VERSION_LEGACY
    || typeof raw.channel_mode !== "string";
}

/** 按原有通道数反推：优先精确匹配，其次取能容纳它的最小模式，最后按最大模式 */
function inferChannelModeByCount(channelCount: number): ChannelModeType {
  const exact = ChannelMode.find((mode) => ChannelModeChannels[mode] === channelCount);
  if (exact) return exact;
  const enough = ChannelMode
    .filter((mode) => ChannelModeChannels[mode] >= channelCount)
    .sort((a, b) => ChannelModeChannels[a] - ChannelModeChannels[b]);
  return enough[0] ?? "MOVING_HEAD";
}

function toPositiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toIntOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : null;
}
