export const LOG_TEMPLATES = {
  Fixture: [
    "灯具 {fixtureCode} 创建完成，通道模式 {channelMode}，占用 {channelCount} 个通道",
    "灯具 {fixtureCode} 更新：字段 {fields} 已变更",
    "灯具 {fixtureCode} 通道模式 {fromMode} → {toMode}（版本 {fromVersion} → {toVersion}），引用场景已作废重算",
    "灯具 {fixtureCode} 通道模式提交冲突：期望版本 {expectedVersion}，当前版本 {actualVersion}，先提交版本生效",
    "灯具 {fixtureCode} 灯位锁定状态变更为 {locked}",
    "灯具导出 {count} 条编址记录"
  ],
  CueScene: [
    "灯光场景 {sceneName} 创建完成",
    "灯光场景 {sceneName} 更新：字段 {fields} 已变更",
    "灯光场景 {sceneName} 因灯具 {fixtureCode} 通道模式改动而作废，开始重算",
    "灯光场景 {sceneName} 重算完成，状态恢复 READY",
    "灯光场景 {sceneName} 状态变更为 {status}",
    "灯光场景导出 {count} 条"
  ],
  TimelineTrack: ["时间轴轨道创建", "时间轴轨道更新", "时间轴轨道状态变更", "时间轴轨道导出"],
  ShowProject: ["演出方案创建", "演出方案更新", "演出方案状态变更", "演出方案导出"],
  DmxLayout: [
    "编址排布完成：{universeCount} 个宇宙，已排入 {placedCount} 盏，排队 {unplacedCount} 盏，还缺 {shortageChannels} 个通道",
    "锁定灯位 {fixtureCode} 保留原址：宇宙 {universe} 地址 {startAddress}-{endAddress}",
    "灯具 {fixtureCode} 排队等待下一宇宙"
  ]
};
