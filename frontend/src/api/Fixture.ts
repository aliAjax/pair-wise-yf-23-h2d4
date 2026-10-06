import { mockData } from "../mocks/seedData";
import type { Fixture, LegacyFixture } from "../types/Fixture";
import { backfillFixtures } from "../utils/backfill";
import { saveFixtureWithConflictCheck, type SaveFixtureResult } from "../services/fixtureService";

const endpoint = "/api/fixture";

/**
 * 列出灯具。旧数据没有 channel_mode 字段，加载时按原来的通道数回填。
 */
export async function listFixture(): Promise<Fixture[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const raw = mockData.fixture as unknown as LegacyFixture[];
  return backfillFixtures(raw);
}

/**
 * 保存灯具（普通保存，无冲突检测）。
 */
export async function saveFixture(payload: Fixture): Promise<Fixture> {
  console.info("save Fixture", payload);
  return payload;
}

/**
 * 保存灯具并做乐观锁冲突检测。
 * 先提交的一版生效，晚到的列出差异。
 */
export async function saveFixtureWithConflict(
  current: Fixture,
  incoming: Fixture,
  baseVersion?: number
): Promise<SaveFixtureResult> {
  return saveFixtureWithConflictCheck(current, incoming, baseVersion);
}
