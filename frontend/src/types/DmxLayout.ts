import type { Fixture } from "./Fixture";

/** 编址结果状态：已排入 / 单宇宙装不下 / 所有宇宙都排满仍在排队 */
export type PlacementStatus = "PLACED" | "TOO_LARGE" | "UNIVERSE_EXHAUSTED";

export interface FixturePlacement {
  fixture: Fixture;
  universe: number | null;
  startAddress: number | null;
  endAddress: number | null;
  locked: boolean;
  status: PlacementStatus;
}

export interface UniverseLayout {
  universe: number;
  capacity: number;
  used: number;
  free: number;
  placements: FixturePlacement[];
}

export interface DmxLayout {
  universes: UniverseLayout[];
  placements: FixturePlacement[];
  /** 排队（未排入任何宇宙）的灯具 */
  unplaced: FixturePlacement[];
  /** 排队灯具的通道数合计，即当前宇宙容量下还缺多少通道 */
  shortageChannels: number;
  totalChannels: number;
}
