import type { Fixture } from "../types/Fixture";
import { ChannelModeChannelCount } from "../constants/ChannelMode";

/** 单个灯具的编址结果 */
export interface DmxAssignment {
  fixtureId: number;
  fixtureCode: string;
  channelCount: number;
  universe: number;
  dmxAddress: number;
  locked: boolean;
  /** 该灯具从上一宇宙排队过来 */
  overflow: boolean;
}

/** 单个宇宙的通道使用汇总 */
export interface UniverseSummary {
  universe: number;
  usedChannels: number;
  freeChannels: number;
  fixtureCount: number;
  assignments: DmxAssignment[];
}

/** 编址排布计划 */
export interface AddressingPlan {
  assignments: DmxAssignment[];
  universes: UniverseSummary[];
  totalChannels: number;
  totalCapacity: number;
  totalFreeChannels: number;
  overflowCount: number;
  /** 所有宇宙的空闲通道数（即可核对的"还缺多少"） */
  missingChannels: number;
  collisionCount: number;
}

export const DMX_UNIVERSE_CAPACITY = 512;

/**
 * 取灯具的通道数：优先 channel_count，缺失时按 channel_mode 回填。
 */
export function resolveChannelCount(fixture: Fixture): number {
  if (fixture.channel_count && fixture.channel_count > 0) return fixture.channel_count;
  return ChannelModeChannelCount[fixture.channel_mode] ?? ChannelModeChannelCount.RGB;
}

interface OccupiedRange {
  start: number;
  end: number;
  fixtureId: number;
}

/**
 * 检查某宇宙中 [start, end] 区间是否与已占用区间冲突。
 */
function findCollision(occupied: OccupiedRange[], start: number, end: number): OccupiedRange | null {
  return occupied.find((r) => start <= r.end && end >= r.start) ?? null;
}

/**
 * 在指定宇宙中，从 fromAddress 开始找第一个能容纳 channelCount 通道的起始地址。
 * 跳过已占用区间。找不到返回 null。
 */
function findFreeAddress(
  occupied: OccupiedRange[],
  fromAddress: number,
  channelCount: number
): number | null {
  let candidate = fromAddress;
  for (const range of occupied) {
    if (range.end < candidate) continue;
    if (range.start > candidate) {
      // candidate 到 range.start-1 是空闲区间
      if (candidate + channelCount - 1 < range.start) return candidate;
    }
    candidate = Math.max(candidate, range.end + 1);
    if (candidate + channelCount - 1 > DMX_UNIVERSE_CAPACITY) return null;
  }
  if (candidate + channelCount - 1 <= DMX_UNIVERSE_CAPACITY) return candidate;
  return null;
}

/**
 * 编址排布算法：
 * 1. 已锁定灯具留在原址；
 * 2. 其余灯具按通道数顺序补齐，当前宇宙装不下就排队到下一宇宙；
 * 3. 返回可核对的排布计划（每宇宙已用/空闲通道数、溢出数量）。
 */
export function computeAddressingPlan(fixtures: Fixture[]): AddressingPlan {
  const locked: DmxAssignment[] = [];
  const unlocked: Fixture[] = [];
  const occupiedByUniverse = new Map<number, OccupiedRange[]>();
  let collisionCount = 0;

  // Pass 1: 锁定灯具留在原址
  for (const f of fixtures) {
    const channelCount = resolveChannelCount(f);
    if (f.dmx_address_locked && f.dmx_address >= 1 && f.dmx_address <= DMX_UNIVERSE_CAPACITY) {
      const start = f.dmx_address;
      const end = start + channelCount - 1;
      const universe = f.universe || 1;
      const occupied = occupiedByUniverse.get(universe) ?? [];
      const collision = findCollision(occupied, start, end);
      if (collision) {
        collisionCount += 1;
      } else {
        occupied.push({ start, end, fixtureId: f.id });
        occupiedByUniverse.set(universe, occupied);
      }
      locked.push({
        fixtureId: f.id,
        fixtureCode: f.fixture_code,
        channelCount,
        universe,
        dmxAddress: start,
        locked: true,
        overflow: false
      });
    } else {
      unlocked.push(f);
    }
  }

  // Pass 2: 未锁定灯具顺序补齐，装不下排队到下一宇宙
  const unlockedAssignments: DmxAssignment[] = [];
  let currentUniverse = 1;
  let currentAddress = 1;
  let overflowCount = 0;

  for (const f of unlocked) {
    const channelCount = resolveChannelCount(f);
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts += 1;
      const occupied = occupiedByUniverse.get(currentUniverse) ?? [];
      const freeAddr = findFreeAddress(occupied, currentAddress, channelCount);

      if (freeAddr !== null) {
        const end = freeAddr + channelCount - 1;
        occupied.push({ start: freeAddr, end, fixtureId: f.id });
        occupiedByUniverse.set(currentUniverse, occupied);
        unlockedAssignments.push({
          fixtureId: f.id,
          fixtureCode: f.fixture_code,
          channelCount,
          universe: currentUniverse,
          dmxAddress: freeAddr,
          locked: false,
          overflow: attempts > 1 || overflowCount > 0
        });
        if (attempts > 1) overflowCount += 1;
        currentAddress = end + 1;
        placed = true;
      } else {
        // 当前宇宙装不下，排队到下一宇宙
        currentUniverse += 1;
        currentAddress = 1;
      }
    }
  }

  const assignments = [...locked, ...unlockedAssignments];

  // 按宇宙汇总
  const universeMap = new Map<number, UniverseSummary>();
  for (const a of assignments) {
    const summary = universeMap.get(a.universe) ?? {
      universe: a.universe,
      usedChannels: 0,
      freeChannels: DMX_UNIVERSE_CAPACITY,
      fixtureCount: 0,
      assignments: []
    };
    summary.usedChannels += a.channelCount;
    summary.freeChannels = DMX_UNIVERSE_CAPACITY - summary.usedChannels;
    summary.fixtureCount += 1;
    summary.assignments.push(a);
    universeMap.set(a.universe, summary);
  }

  const universes = Array.from(universeMap.values()).sort((a, b) => a.universe - b.universe);
  const totalChannels = assignments.reduce((sum, a) => sum + a.channelCount, 0);
  const totalCapacity = universes.length * DMX_UNIVERSE_CAPACITY;
  const totalFreeChannels = universes.reduce((sum, u) => sum + u.freeChannels, 0);

  return {
    assignments,
    universes,
    totalChannels,
    totalCapacity,
    totalFreeChannels,
    overflowCount,
    missingChannels: totalFreeChannels,
    collisionCount
  };
}

/**
 * 将排布计划应用回灯具列表，返回更新后的灯具（universe / dmx_address）。
 */
export function applyAddressingPlan(fixtures: Fixture[], plan: AddressingPlan): Fixture[] {
  const assignmentMap = new Map(plan.assignments.map((a) => [a.fixtureId, a]));
  return fixtures.map((f) => {
    const a = assignmentMap.get(f.id);
    if (!a) return f;
    return { ...f, universe: a.universe, dmx_address: a.dmxAddress };
  });
}
