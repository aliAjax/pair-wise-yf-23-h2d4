import type { ConflictResult } from "../../utils/conflict";

interface Props {
  conflict: ConflictResult;
  onDismiss: () => void;
  onAcceptTheirs: () => void;
}

export function ConflictBanner({ conflict, onDismiss, onAcceptTheirs }: Props) {
  return (
    <div className="conflict-banner">
      <div className="conflict-head">
        <strong>⚠️ 灯具已被其他灯光师修改</strong>
        <button className="conflict-close" onClick={onDismiss}>×</button>
      </div>
      <p className="conflict-desc">先提交的一版已生效，以下是你提交的版本与当前生效版本的差异：</p>
      <table className="conflict-table">
        <thead>
          <tr>
            <th>字段</th>
            <th>你提交的版本</th>
            <th>当前生效版本</th>
          </tr>
        </thead>
        <tbody>
          {conflict.diffs.map((d) => (
            <tr key={d.field}>
              <td>{d.label}</td>
              <td className="diff-yours">{String(d.yours)}</td>
              <td className="diff-theirs">{String(d.theirs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="conflict-actions">
        <button className="btn-primary" onClick={onAcceptTheirs}>采用当前生效版本</button>
        <button onClick={onDismiss}>关闭</button>
      </div>
    </div>
  );
}
