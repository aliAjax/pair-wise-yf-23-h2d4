import type { ChannelMode } from "./ChannelMode";

/**
 * 灯具。
 * - channel_mode 是通道模式（RGB/RGBW/DIMMER_ONLY/MOVING_HEAD），决定通道数；
 * - dmx_universe / dmx_address 由编址排布计算得出，dmx_universe 为 null 表示装不下、在排队；
 * - address_locked 为 true 的灯位已锁定，排布时留在原址不动；
 * - mode_version 用于通道模式并发修改的乐观并发控制：先提交的一版生效。
 */
export interface Fixture {
  id: number;
  fixture_code: string;
  fixture_type: string;
  position_x: number;
  position_y: number;
  /** 所属宇宙（从 1 起）；放不下时为 null */
  dmx_universe: number | null;
  /** 宇宙内起始地址（1-512）；放不下时为 null */
  dmx_address: number | null;
  channel_count: number;
  channel_mode: ChannelMode;
  /** 灯位/编址是否锁定，锁定后自动排布保持原址 */
  address_locked: boolean;
  /** 通道模式版本号，每次通道模式被修改后 +1，并发提交据此判定先后 */
  mode_version: number;
}
