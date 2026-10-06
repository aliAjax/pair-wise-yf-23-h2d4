import type { ChannelMode } from "./ChannelMode";

export interface Fixture {
  id: number;
  fixture_code: string;
  fixture_type: string;
  position_x: string;
  position_y: string;
  dmx_address: number;
  universe: number;
  channel_count: number;
  channel_mode: ChannelMode;
  color_mode: string;
  dmx_address_locked: boolean;
  version: number;
}

/**
 * 旧版灯具数据结构：没有 channel_mode / universe / dmx_address_locked / version，
 * dmx_address 与 channel_count 可能是字符串。升级时由 backfill 模块回填。
 */
export interface LegacyFixture {
  id: number;
  fixture_code: string;
  fixture_type: string;
  position_x: string;
  position_y: string;
  dmx_address: string | number;
  channel_count: string | number;
  color_mode: string;
}
