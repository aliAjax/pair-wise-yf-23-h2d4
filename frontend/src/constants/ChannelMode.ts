export const ChannelMode = ["RGB", "RGBW", "DIMMER_ONLY", "MOVING_HEAD"] as const;
export type ChannelMode = (typeof ChannelMode)[number];

/** 各通道模式占用的 DMX 通道数；通道模式一改，通道数按此表重算 */
export const ChannelModeChannels: Record<ChannelMode, number> = {
  RGB: 3,
  RGBW: 4,
  DIMMER_ONLY: 1,
  MOVING_HEAD: 8
};

export const ChannelModeText: Record<ChannelMode, string> = {
  RGB: "RGB",
  RGBW: "RGBW",
  DIMMER_ONLY: "仅调光",
  MOVING_HEAD: "摇头灯"
};
