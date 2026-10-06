import type { Fixture } from "../types/Fixture";
import { detectFixtureConflict, formatConflictDiffs, type ConflictResult } from "../utils/conflict";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";

export interface SaveFixtureResult {
  ok: boolean;
  fixture?: Fixture;
  errorCode?: string;
  errorMessage?: string;
  conflict?: ConflictResult;
}

/**
 * 保存灯具（带乐观锁冲突检测）。
 * 先提交的一版生效，晚到的列差异。
 */
export async function saveFixtureWithConflictCheck(
  current: Fixture,
  incoming: Fixture,
  baseVersion?: number
): Promise<SaveFixtureResult> {
  const conflict = detectFixtureConflict(current, incoming, baseVersion);
  if (conflict.hasConflict) {
    const message = `${ERROR_MESSAGES.FIXTURE_VERSION_CONFLICT}；${formatConflictDiffs(conflict.diffs)}`;
    console.warn(`[${LOG_TEMPLATES.Fixture[6]}]`, message);
    return {
      ok: false,
      errorCode: ERROR_CODES.FIXTURE_VERSION_CONFLICT,
      errorMessage: message,
      conflict
    };
  }

  const saved: Fixture = {
    ...incoming,
    version: (current.version ?? 1) + 1
  };
  console.info(`[${LOG_TEMPLATES.Fixture[1]}]`, saved.fixture_code);
  return { ok: true, fixture: saved };
}

/**
 * 灯具通道模式变更日志。
 */
export function logChannelModeChange(fixture: Fixture, previousMode: string): void {
  console.info(`[${LOG_TEMPLATES.Fixture[4]}]`, {
    fixtureId: fixture.id,
    fixtureCode: fixture.fixture_code,
    from: previousMode,
    to: fixture.channel_mode
  });
}

/**
 * 灯具编址完成日志。
 */
export function logAddressingComplete(fixtureCount: number, universeCount: number): void {
  console.info(`[${LOG_TEMPLATES.Fixture[5]}]`, { fixtureCount, universeCount });
}

/**
 * 旧数据回填日志。
 */
export function logLegacyBackfill(count: number): void {
  console.info(`[${LOG_TEMPLATES.Fixture[7]}]`, { count });
}
