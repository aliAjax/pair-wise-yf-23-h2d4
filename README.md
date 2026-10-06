# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。

## 灯具编址与通道模式联动

### DMX 宇宙排布（512 容量）

灯具布置页 `/fixtures` 提供可核对的 DMX 编址排布：

- 单个宇宙容量 512 通道，按 `channel_mode` 对应的通道数计算（DIMMER_ONLY=1、RGB=3、RGBW=4、MOVING_HEAD=16）。
- 装不下的灯具自动排队到下一宇宙，宇宙卡片显示已用/空闲通道数（即"还缺多少"）。
- 已锁定灯位（`dmx_address_locked=true`）留在原址，其余灯具按通道数顺序补齐。
- 编址算法在 `utils/dmxAddressing.ts`，通过 Web Worker（`workers/dmxAddressWorker.ts`）卸载耗时计算。

### 通道模式变更 -> 场景作废重算

- 灯具的 `channel_mode` 一有改动，引用它的场景（`fixture_states` 中包含该灯具）立即标记为作废（`stale=true`）。
- 场景作废后触发重算（`services/sceneService.ts`），重算完成前舞台预览不播放。
- 事件总线（`utils/eventBus.ts`）解耦灯具变更与场景作废。

### 并发修改冲突（乐观锁）

- 两位灯光师同时修改同一盏灯的通道模式时，以 `version` 字段做乐观锁。
- 先提交的一版生效；晚到的一版列出与当前生效版本的字段差异（`utils/conflict.ts`）。
- 页面顶部展示冲突横幅，支持采用当前生效版本或关闭。

### 旧数据回填

- 旧数据没有 `channel_mode` 字段，升级时按原来的 `channel_count` 回填（`utils/backfill.ts`）：
  - 1 通道 -> DIMMER_ONLY，3 通道 -> RGB，4 通道 -> RGBW，其余 -> MOVING_HEAD。
- 同时回填 `universe`、`dmx_address_locked`、`version` 等字段。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
