export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  FIXTURE_MODE_CONFLICT: "灯具 {fixtureCode} 的通道模式已被另一位灯光师先提交（版本 {expectedVersion} → {actualVersion}），本次修改未生效，请核对差异后重试",
  DMX_UNIVERSE_OVERFLOW: "灯具 {fixtureCode} 需要 {channelCount} 个通道，超出单宇宙 {capacity} 的容量，无法编址",
  SCENE_RECALCULATING: "引用灯具 {fixtureCode} 的场景正在重算，舞台预览暂不播放"
} as const;
