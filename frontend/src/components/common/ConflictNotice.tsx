import type { ModeConflict } from "../../stores/FixtureStore";
import { ChannelModeText } from "../../constants/ChannelMode";

/** 通道模式并发冲突卡：先提交一版生效，晚到一版在这里列出差异 */
export function ConflictNotice({
  conflict,
  onDismiss,
  onRefresh
}: {
  conflict: ModeConflict;
  onDismiss: () => void;
  onRefresh: () => void;
}) {
  const modeChanged = conflict.attemptedMode !== conflict.currentMode;
  return (
    <div className="panel conflict-panel" role="alert">
      <h3>提交冲突：{conflict.fixtureCode}</h3>
      <p>另一位灯光师的版本（v{conflict.actualVersion}）已先生效，您依据的是 v{conflict.expectedVersion}，本次修改未保存。差异如下：</p>
      <table className="diff-table">
        <thead>
          <tr><th>字段</th><th>您的晚到版本</th><th>已生效版本</th></tr>
        </thead>
        <tbody>
          <tr className={modeChanged ? "diff" : ""}>
            <td>通道模式</td>
            <td>{ChannelModeText[conflict.attemptedMode]}（{conflict.attemptedChannelCount} 通道）</td>
            <td>{ChannelModeText[conflict.currentMode]}（{conflict.currentChannelCount} 通道）</td>
          </tr>
          <tr>
            <td>版本号</td>
            <td>基于 v{conflict.expectedVersion}</td>
            <td>v{conflict.actualVersion}</td>
          </tr>
        </tbody>
      </table>
      <div className="property-actions">
        <button className="primary" onClick={onRefresh}>用最新版本刷新后重试</button>
        <button onClick={onDismiss}>关闭</button>
      </div>
    </div>
  );
}
