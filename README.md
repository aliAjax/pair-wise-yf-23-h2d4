# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后访问 <http://localhost:20113>。

## 演出前加灯：可核对的 DMX 编址排布

灯具布置页（`/fixtures`）围绕“同一宇宙通道加起来超过 512”的场景实现：

- **单宇宙容量 512**：`constants/Dmx.ts` 中的 `DMX_UNIVERSE_CAPACITY`；灯具占用连续通道，不跨宇宙拆分。
- **装不下就排队等下一个宇宙**：`utils/dmxLayout.ts` 的 `planDmxLayout` 对未锁定灯具按 first-fit 依次补齐，当前宇宙剩余空间放不下时自动落到下一宇宙（`DMX_MAX_UNIVERSES`，本配置为 2）。
- **已锁定灯位留在原址**：`Fixture.address_locked` 的灯具保留其 `dmx_universe/dmx_address` 并先预留地址区间，自动排布只会填空隙；锁位越界或与其他锁位冲突时同样进入排队。
- **写明还缺多少**：所有宇宙排满后仍放不下的灯进入“排队灯具”列表，`shortageChannels` 汇总还缺多少通道，页面顶部统计卡和宇宙板均显示。
- **通道模式决定通道数**：`constants/ChannelMode.ts` 的 `ChannelModeChannels`（RGB=3 / RGBW=4 / DIMMER_ONLY=1 / MOVING_HEAD=8），改模式立即重算通道数并触发重新排布。

### 通道模式改动联动

1. 在属性面板提交模式修改 → `FixtureStore.changeChannelMode` → `api/Fixture.commitFixtureModeChange`。
2. **引用该灯具的场景立即作废**：`CueSceneStore.invalidateByFixture` 把相关场景置为 `OUTDATED`，随后 `RECALCULATING` 调 `api/CueScene.recalculateScene` 重算，完成才回到 `READY`。
3. **没算完舞台预览不跟着播**：`useTimelinePlayback(duration, recalculating)` 在重算期间禁止启动播放、正在播放立即暂停；`StageCanvas` 在 blocked 时只渲染静态灯位。

### 两位灯光师同时改同一盏灯

- 灯具带 `mode_version`，提交时必须带“我依据的版本”。
- 版本一致 → 生效且 `mode_version + 1`；不一致 → 抛 `FixtureModeConflictError`（错误码 `FIXTURE_MODE_CONFLICT`），**先提交的一版生效**，晚到一版由 `components/common/ConflictNotice` 列出模式、通道数、版本号差异，刷新到最新版本后可重试。
- 属性面板的“模拟同事先提交”按钮可现场复现该并发场景。

### 旧数据升级

- 旧记录没有 `channel_mode` 字段（种子里的 `FIX-LEGACY` 即旧格式），`utils/fixtureMigration.ts` 的 `migrateFixture` 在 `api/Fixture.listFixture` 读入时**按原来的 channel_count 回填通道模式**（3→RGB、4→RGBW、1→DIMMER_ONLY、8→MOVING_HEAD，其他按容量就近归档），并保留原通道数不变。

## 访问地址或 CLI 示例

前端：<http://localhost:20113>

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 类型检查与构建：`cd frontend && npm run build`
- 编址/并发/迁移逻辑可用 esbuild 直接跑 `utils` 与 `api` 下的纯函数做快速验证。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Zustand + IndexedDB |
| 后端 | - |
| 数据库 | 本地 mock / localStorage（IndexedDB 风格封装） |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（含通道模式乐观锁、场景重算）
├── stores/               # FixtureStore / CueSceneStore 等独立 store
├── types/                # Fixture / CueScene / TimelineTrack / DmxLayout
├── constants/            # 枚举、Dmx 常量、日志模板、错误码与错误消息
├── constructors/         # 默认对象、表单对象、响应对象构造器
├── components/common/    # FixturePlan / UniverseBoard / DmxBadge / PropertyPanel 等
├── hooks/                # useDmxAddressCheck / useTimelinePlayback / useIndexedDbStore
├── pages/                # 灯具布置 / 场景编辑 / 时间轴编排 / 舞台预览
├── router/
├── utils/                # dmxLayout / fixtureMigration / formatters
└── mocks/
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 前端多阶段构建，最终由 Nginx 托管，`try_files` 支持 SPA 路由。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: `constants/FixtureType`、`types/FixtureType`、constructors、logTemplates、errorMessages、筛选器、`FixtureIcon`/`PropertyPanel` 展示组件。
- CueStatus: `constants/CueStatus`（新增 `OUTDATED`/`RECALCULATING`）、`types/CueStatus`、constructors、logTemplates、errorMessages、`StatusBadge`、`CueCard`、`TimelineRuler`、场景页/时间轴页/预览页。
- ChannelMode: `constants/ChannelMode`（含 `ChannelModeChannels` 通道数表、`ChannelModeText`）、`types/ChannelMode`、constructors、logTemplates、errorMessages、`ColorChannelSlider`、`PropertyPanel`、`ConflictNotice`、`fixtureMigration`。
- Dmx: `constants/Dmx`（512 容量、宇宙数、数据版本号）→ `utils/dmxLayout` → `useDmxAddressCheck` → `UniverseBoard`/`DmxBadge`/`FixtureAddressTable`/formatters。

## 为什么会牵一发动全身

通道模式的一次修改会同时触达：通道数常量表、Fixture 类型与构造器、乐观锁 API、FixtureStore（冲突差异与日志）、CueSceneStore（作废与重算状态机）、场景重算 API、时间轴播放 hook、舞台画布与预览页、编址排布算法、宇宙核对板和 README；旧数据还要经过迁移构造器回填。状态、日志、错误码、错误消息、格式化与展示组件分散在各自独立文件中，任何字段调整都需要跨层同步。

## License

MIT
