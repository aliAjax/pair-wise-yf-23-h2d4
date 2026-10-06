import { DMX_UNIVERSE_CAPACITY } from "../constants/Dmx";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

/** 编址文案：未排入显示“排队中”，否则显示 宇宙号.地址 */
export const formatDmxAddress = (universe: number | null, address: number | null) =>
  universe === null || address === null ? "排队中" : `U${universe}.${address}`;

/** 宇宙占用文案：已用 / 512（剩余 N） */
export const formatUniverseUsage = (used: number, free: number) =>
  `${formatNumber(used)} / ${DMX_UNIVERSE_CAPACITY}（剩余 ${formatNumber(free)}）`;
