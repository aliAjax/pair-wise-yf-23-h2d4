import type { Fixture } from "../types/Fixture";
import type { ChannelMode } from "../types/ChannelMode";
import { ChannelModeChannels } from "../constants/ChannelMode";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 0,
  fixture_code: "",
  fixture_type: "PAR",
  position_x: 0,
  position_y: 0,
  dmx_universe: null,
  dmx_address: null,
  channel_count: ChannelModeChannels.RGB,
  channel_mode: "RGB",
  address_locked: false,
  mode_version: 1,
  ...overrides
});

/** 新增灯具表单对象：等待自动编址 */
export const createFixtureForm = (overrides: Partial<Fixture> = {}): Fixture =>
  createDefaultFixture(overrides);

/** 通道模式变更表单：通道数随模式补齐，mode_version 由 API 并发控制决定 */
export const createFixtureModeForm = (
  fixture: Fixture,
  channelMode: ChannelMode
): Pick<Fixture, "id" | "channel_mode" | "channel_count" | "mode_version"> => ({
  id: fixture.id,
  channel_mode: channelMode,
  channel_count: ChannelModeChannels[channelMode],
  mode_version: fixture.mode_version
});

export const createFixtureResponse = createDefaultFixture;
