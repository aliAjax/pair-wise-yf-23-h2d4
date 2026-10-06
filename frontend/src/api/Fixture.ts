import { mockData, legacyFixtureSeed } from "../mocks/seedData";
import type { Fixture } from "../types/Fixture";
import type { ChannelMode } from "../types/ChannelMode";
import { migrateFixture } from "../utils/fixtureMigration";
import { ERROR_CODES } from "../constants/errorCodes";

const endpoint = "/api/fixture";

/** 通道模式并发提交冲突：先提交的一版生效，晚到的一版被拒绝并回传差异 */
export class FixtureModeConflictError extends Error {
  code = ERROR_CODES.FIXTURE_MODE_CONFLICT;
  constructor(
    readonly fixtureCode: string,
    readonly expectedVersion: number,
    readonly actual: Fixture,
    readonly attemptedMode: ChannelMode,
    readonly attemptedChannelCount: number
  ) {
    super(ERROR_CODES.FIXTURE_MODE_CONFLICT);
  }
}

export interface ModeModePatch {
  id: number;
  channel_mode: ChannelMode;
  channel_count: number;
  /** 提交方依据的版本号；与当前版本不一致即判定晚到 */
  expected_version: number;
}

export interface ModeModeResult {
  fixture: Fixture;
  /** 引用了该灯具、因此被作废重算的场景 id */
  affectedSceneIds: number[];
}

export async function listFixture(): Promise<Fixture[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  // 常规种子 + 一条无 channel_mode 的旧数据，升级时按原 channel_count 回填
  const rows = mockData.fixture.map((row) => migrateFixture(row as unknown as Record<string, unknown>));
  rows.push(migrateFixture(legacyFixtureSeed));
  return rows.sort((a, b) => a.id - b.id);
}

export async function saveFixture(payload: Fixture) {
  console.info("save Fixture", payload);
  return payload;
}

/**
 * 提交通道模式修改。模拟服务端乐观锁：
 * - expected_version 与当前记录一致 → 生效，通道数随模式更新，版本号 +1；
 * - 不一致 → 抛 FixtureModeConflictError，由调用方列出差异。
 *
 * 纯函数实现（数据由 store 持有），store 通过 applyFixtureModeCommit 应用结果。
 */
export function commitFixtureModeChange(current: Fixture, patch: Omit<ModeModePatch, "id">): ModeModeResult {
  if (patch.expected_version !== current.mode_version) {
    throw new FixtureModeConflictError(
      current.fixture_code,
      patch.expected_version,
      current,
      patch.channel_mode,
      patch.channel_count
    );
  }
  const updated: Fixture = {
    ...current,
    channel_mode: patch.channel_mode,
    channel_count: patch.channel_count,
    mode_version: current.mode_version + 1
  };
  return { fixture: updated, affectedSceneIds: [] };
}
