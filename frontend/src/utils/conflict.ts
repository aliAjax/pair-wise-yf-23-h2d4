import type { Fixture } from "../types/Fixture";

export interface FieldDiff {
  field: string;
  label: string;
  yours: unknown;
  theirs: unknown;
}

export interface ConflictResult {
  hasConflict: boolean;
  diffs: FieldDiff[];
  current: Fixture;
}

const FIELD_LABELS: Record<string, string> = {
  fixture_code: "灯具编号",
  fixture_type: "灯具类型",
  position_x: "位置 X",
  position_y: "位置 Y",
  dmx_address: "DMX 地址",
  universe: "宇宙",
  channel_count: "通道数",
  channel_mode: "通道模式",
  color_mode: "颜色模式",
  dmx_address_locked: "地址锁定",
  version: "版本号"
};

/**
 * 检测两位灯光师同时修改同一盏灯的冲突。
 * 以当前存储版本为准，列出晚到一版与当前版本的差异。
 */
export function detectFixtureConflict(
  current: Fixture,
  incoming: Fixture,
  baseVersion?: number
): ConflictResult {
  const hasConflict = baseVersion !== undefined && current.version > baseVersion;
  if (!hasConflict) {
    return { hasConflict: false, diffs: [], current };
  }

  const diffs: FieldDiff[] = [];
  const keys = Object.keys(FIELD_LABELS) as (keyof Fixture)[];
  for (const key of keys) {
    if (key === "version") continue;
    const yours = incoming[key];
    const theirs = current[key];
    if (JSON.stringify(yours) !== JSON.stringify(theirs)) {
      diffs.push({
        field: key,
        label: FIELD_LABELS[key],
        yours,
        theirs
      });
    }
  }

  return { hasConflict: true, diffs, current };
}

/**
 * 格式化差异为可读文本。
 */
export function formatConflictDiffs(diffs: FieldDiff[]): string {
  if (diffs.length === 0) return "无差异";
  return diffs.map((d) => `${d.label}: 你提交的=${String(d.yours)}，当前生效=${String(d.theirs)}`).join("；");
}
