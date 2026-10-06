export const CueStatus = ["DRAFT", "READY", "DISABLED", "ARCHIVED", "OUTDATED", "RECALCULATING"] as const;
export type CueStatus = (typeof CueStatus)[number];
export const CueStatusText: Record<CueStatus, string> = {
  DRAFT: "草稿",
  READY: "就绪",
  DISABLED: "停用",
  ARCHIVED: "归档",
  OUTDATED: "已作废",
  RECALCULATING: "重算中"
};
