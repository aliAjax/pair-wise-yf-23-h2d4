export const ChannelMode = ["RGB", "RGBW", "DIMMER_ONLY", "MOVING_HEAD"] as const;
export type ChannelMode = (typeof ChannelMode)[number];
export const ChannelModeText: Record<ChannelMode, string> = Object.fromEntries(
  ChannelMode.map((value) => [value, value.replace(/_/g, " ")])
) as Record<ChannelMode, string>;

/**
 * 每种通道模式占用的通道数。编址算法据此计算宇宙容量。
 */
export const ChannelModeChannelCount: Record<ChannelMode, number> = {
  DIMMER_ONLY: 1,
  RGB: 3,
  RGBW: 4,
  MOVING_HEAD: 16
};

/**
 * 通道模式对应的通道名称列表，用于场景状态与重算。
 */
export const ChannelModeChannelNames: Record<ChannelMode, string[]> = {
  DIMMER_ONLY: ["dimmer"],
  RGB: ["r", "g", "b"],
  RGBW: ["r", "g", "b", "w"],
  MOVING_HEAD: ["pan", "tilt", "dimmer", "r", "g", "b", "w", "strobe", "focus", "zoom", "gobo", "prism", "frost", "macro", "speed", "control"]
};
