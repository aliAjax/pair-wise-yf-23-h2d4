import type { ChannelMode } from "../types/ChannelMode";
import { ChannelModeChannels } from "../constants/ChannelMode";
import type { Fixture } from "../types/Fixture";

/**
 * 演出前临时调入的新灯具：260 盏 + 2 盏锁定原址灯 + 1 盏通道数异常灯。
 * 通道合计约 1056，单宇宙 512 装不下，需要排队等第二个宇宙，
 * 且两个宇宙也排不下，普通灯和异常灯都在排队，灯具布置页会写明还缺多少通道。
 * 其中 FIX-L01 / FIX-L02 已锁定灯位，排布时留在原址。
 */
function buildFixtures(): Fixture[] {
  const modes: ChannelMode[] = ["RGB", "RGBW", "DIMMER_ONLY", "MOVING_HEAD"];
  const types = ["PAR", "SPOT", "WASH", "BEAM", "STROBE"];
  const rows: Fixture[] = [];
  const columns = 16;

  // 两盏已锁定灯位的灯，原址 U1.1 和 U1.501
  rows.push({
    id: 901,
    fixture_code: "FIX-L01",
    fixture_type: "SPOT",
    position_x: 120,
    position_y: 80,
    dmx_universe: 1,
    dmx_address: 1,
    channel_count: ChannelModeChannels.MOVING_HEAD,
    channel_mode: "MOVING_HEAD",
    address_locked: true,
    mode_version: 3
  });
  rows.push({
    id: 902,
    fixture_code: "FIX-L02",
    fixture_type: "WASH",
    position_x: 680,
    position_y: 80,
    dmx_universe: 1,
    dmx_address: 501,
    channel_count: ChannelModeChannels.RGBW,
    channel_mode: "RGBW",
    address_locked: true,
    mode_version: 1
  });

  for (let i = 1; i <= 260; i += 1) {
    const mode = modes[i % modes.length];
    rows.push({
      id: i,
      fixture_code: `FIX-${String(i).padStart(3, "0")}`,
      fixture_type: types[i % types.length],
      position_x: 40 + (i % columns) * 46,
      position_y: 40 + Math.floor(i / columns) * 30,
      dmx_universe: null,
      dmx_address: null,
      channel_count: ChannelModeChannels[mode],
      channel_mode: mode,
      address_locked: false,
      mode_version: 1
    });
  }

  // 数据异常灯：通道模式改造单占用 520 通道，单宇宙永远装不下
  rows.push({
    id: 999,
    fixture_code: "FIX-ERR999",
    fixture_type: "STROBE",
    position_x: 400,
    position_y: 420,
    dmx_universe: null,
    dmx_address: null,
    channel_count: 520,
    channel_mode: "MOVING_HEAD",
    address_locked: false,
    mode_version: 1
  });

  return rows;
}

/** 旧格式数据（没有 channel_mode 字段），用于演示升级时按原通道数回填 */
export const legacyFixtureSeed: Record<string, unknown> = {
  id: 888,
  fixture_code: "FIX-LEGACY",
  fixture_type: "PAR",
  position_x: "240",
  position_y: "420",
  dmx_address: "dmx address 888",
  channel_count: 4,
  color_mode: "color mode 888",
  __schema_version: 0
};

const fixtures = buildFixtures();

export const mockData = {
  fixture: fixtures,
  cueScene: [
    {
      id: 1,
      name: "开场暖场",
      fixture_ids: fixtures.slice(0, 30).map((f) => f.id),
      fixture_states: "{}",
      fade_in_ms: 800,
      hold_ms: 4000,
      priority: 1,
      scene_status: "READY",
      invalidated_by_fixture: null
    },
    {
      id: 2,
      name: "主唱追光",
      fixture_ids: fixtures.slice(20, 60).map((f) => f.id),
      fixture_states: "{}",
      fade_in_ms: 300,
      hold_ms: 6000,
      priority: 2,
      scene_status: "READY",
      invalidated_by_fixture: null
    },
    {
      id: 3,
      name: "全员暗场",
      fixture_ids: fixtures.filter((f) => f.id <= 260).map((f) => f.id),
      fixture_states: "{}",
      fade_in_ms: 1200,
      hold_ms: 2000,
      priority: 0,
      scene_status: "READY",
      invalidated_by_fixture: null
    }
  ],
  timelineTrack: [
    { id: 1, cue_scene_id: 1, start_ms: 0, duration_ms: 4800, layer: 0, locked: false },
    { id: 2, cue_scene_id: 2, start_ms: 5000, duration_ms: 6300, layer: 1, locked: false },
    { id: 3, cue_scene_id: 3, start_ms: 12000, duration_ms: 3200, layer: 0, locked: true }
  ],
  showProject: [
    {
      id: 1,
      title: "2026 巡演 · 首场",
      venue_name: "大剧院主舞台",
      fixture_ids: fixtures.map((f) => f.id),
      track_ids: [1, 2, 3],
      updated_at: "2026-10-05T09:00:00Z"
    }
  ]
};
