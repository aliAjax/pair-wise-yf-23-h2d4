export const ChannelMode = ["RGB", "RGBW", "DIMMER_ONLY", "MOVING_HEAD"] as const;
export type ChannelMode = (typeof ChannelMode)[number];
