import type { Fixture } from "../types/Fixture";
import { ChannelModeChannelCount } from "../constants/ChannelMode";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 0,
  fixture_code: "",
  fixture_type: "SPOT",
  position_x: "0",
  position_y: "0",
  dmx_address: 1,
  universe: 1,
  channel_count: ChannelModeChannelCount.RGB,
  channel_mode: "RGB",
  color_mode: "RGB",
  dmx_address_locked: false,
  version: 1,
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
