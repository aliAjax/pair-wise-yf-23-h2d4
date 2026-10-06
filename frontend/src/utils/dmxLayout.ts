import type { Fixture } from "../types/Fixture";
import type { DmxLayout, FixturePlacement, PlacementStatus, UniverseLayout } from "../types/DmxLayout";
import { DMX_MAX_UNIVERSES, DMX_UNIVERSE_CAPACITY } from "../constants/Dmx";

interface Range {
  start: number;
  end: number;
}

/**
 * DMX 自动编址排布（可核对的排布）：
 * 1. 单个宇宙容量 512，灯具整体占用连续通道，禁止跨宇宙拆分；
 * 2. 已锁定灯位（address_locked）留在原址，其占用区间先做预留；
 * 3. 其余灯具按通道数，用首次适应（first-fit）依次补齐，当前宇宙装不下就排队等下一个宇宙；
 * 4. 超过 DMX_MAX_UNIVERSES 仍放不下的灯具保持排队，shortageChannels 写明还缺多少通道；
 * 5. 单灯通道数 > 512 属于数据错误，标记 TOO_LARGE。
 */
export function planDmxLayout(fixtures: Fixture[]): DmxLayout {
  const reserved: Range[][] = Array.from({ length: DMX_MAX_UNIVERSES }, () => []);
  const byUniverse: Fixture[][] = Array.from({ length: DMX_MAX_UNIVERSES }, () => []);
  const placements = new Map<number, FixturePlacement>();

  const place = (fixture: Fixture, universe: number | null, startAddress: number | null, status: PlacementStatus) => {
    const endAddress = universe === null || startAddress === null
      ? null
      : startAddress + fixture.channel_count - 1;
    const item: FixturePlacement = {
      fixture,
      universe,
      startAddress,
      endAddress,
      locked: fixture.address_locked,
      status
    };
    placements.set(fixture.id, item);
    if (universe !== null) {
      byUniverse[universe - 1].push(fixture);
      if (!fixture.address_locked && startAddress !== null) {
        reserved[universe - 1].push({ start: startAddress, end: endAddress! });
      }
    }
    return item;
  };

  // 第一遍：锁定灯位留在原址并预留区间；原址越界/区间冲突则视作排队
  const locked = fixtures
    .filter((fixture) => fixture.address_locked)
    .sort((a, b) => a.id - b.id);
  for (const fixture of locked) {
    const u = fixture.dmx_universe;
    const start = fixture.dmx_address;
    const inRange = u !== null && start !== null
      && u >= 1 && u <= DMX_MAX_UNIVERSES
      && start >= 1
      && start + fixture.channel_count - 1 <= DMX_UNIVERSE_CAPACITY;
    if (!inRange) {
      place(fixture, null, null, "UNIVERSE_EXHAUSTED");
      continue;
    }
    const range: Range = { start: start!, end: start! + fixture.channel_count - 1 };
    const clash = reserved[u! - 1].some((r) => !(range.end < r.start || range.start > r.end));
    if (clash) {
      place(fixture, null, null, "UNIVERSE_EXHAUSTED");
      continue;
    }
    reserved[u! - 1].push(range);
    place(fixture, u, start, "PLACED");
  }

  // 第二遍：未锁定灯具按 id 顺序首次适应，装不下排队等下一个宇宙
  const unlocked = fixtures
    .filter((fixture) => !fixture.address_locked)
    .sort((a, b) => a.id - b.id);
  for (const fixture of unlocked) {
    if (fixture.channel_count > DMX_UNIVERSE_CAPACITY) {
      place(fixture, null, null, "TOO_LARGE");
      continue;
    }
    let fitted = false;
    for (let u = 1; u <= DMX_MAX_UNIVERSES; u += 1) {
      const start = firstFreeStart(reserved[u - 1], fixture.channel_count);
      if (start !== null) {
        reserved[u - 1].push({ start, end: start + fixture.channel_count - 1 });
        place(fixture, u, start, "PLACED");
        fitted = true;
        break;
      }
    }
    if (!fitted) {
      place(fixture, null, null, "UNIVERSE_EXHAUSTED");
    }
  }

  const universes: UniverseLayout[] = Array.from({ length: DMX_MAX_UNIVERSES }, (_, index) => {
    const universe = index + 1;
    const items = reserved[index].length === 0
      ? []
      : Array.from(placements.values()).filter((p) => p.universe === universe);
    items.sort((a, b) => (a.startAddress ?? 0) - (b.startAddress ?? 0));
    const used = items.reduce((sum, p) => sum + p.fixture.channel_count, 0);
    return {
      universe,
      capacity: DMX_UNIVERSE_CAPACITY,
      used,
      free: DMX_UNIVERSE_CAPACITY - used,
      placements: items
    };
  });

  // 保持与输入一致的顺序输出，便于页面核对
  const ordered = fixtures.map((fixture) => placements.get(fixture.id)!).filter(Boolean);
  const unplaced = ordered.filter((p) => p.universe === null);
  const shortageChannels = unplaced.reduce((sum, p) => sum + p.fixture.channel_count, 0);
  const totalChannels = fixtures.reduce((sum, f) => sum + f.channel_count, 0);

  return { universes, placements: ordered, unplaced, shortageChannels, totalChannels };
}

/** 在已占用区间集合中找第一个能容纳 size 个通道的连续起点 */
function firstFreeStart(ranges: Range[], size: number): number | null {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let cursor = 1;
  for (const range of sorted) {
    if (range.start > cursor && range.start - cursor >= size) {
      return cursor;
    }
    cursor = Math.max(cursor, range.end + 1);
  }
  return cursor + size - 1 <= DMX_UNIVERSE_CAPACITY ? cursor : null;
}
