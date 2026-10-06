export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  FIXTURE_VERSION_CONFLICT: "灯具已被其他灯光师修改，提交失败",
  FIXTURE_NOT_FOUND: "灯具不存在或已被删除",
  DMX_ADDRESS_OVERFLOW: "DMX 地址超出宇宙容量，已排队到下一宇宙",
  SCENE_RECALCULATING: "场景正在重算中，舞台预览暂不可播放",
  LEGACY_BACKFIELD_FAILED: "旧数据回填失败"
};
