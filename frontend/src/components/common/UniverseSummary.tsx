import type { UniverseSummary } from "../../utils/dmxAddressing";
import { DMX_UNIVERSE_CAPACITY } from "../../utils/dmxAddressing";

export function UniverseSummaryPanel({ universes }: { universes: UniverseSummary[] }) {
  if (universes.length === 0) {
    return <div className="empty">暂无排布数据</div>;
  }

  return (
    <div className="universe-grid">
      {universes.map((u) => {
        const usedPct = Math.round((u.usedChannels / DMX_UNIVERSE_CAPACITY) * 100);
        const overflow = u.usedChannels > DMX_UNIVERSE_CAPACITY;
        return (
          <div key={u.universe} className={`universe-card ${overflow ? "overflow" : ""}`}>
            <div className="universe-head">
              <strong>宇宙 {u.universe}</strong>
              <span className="universe-count">{u.fixtureCount} 台灯</span>
            </div>
            <div className="universe-bar">
              <div className="universe-bar-fill" style={{ width: `${Math.min(usedPct, 100)}%` }} />
            </div>
            <div className="universe-stats">
              <span>已用 {u.usedChannels}</span>
              <span>空闲 {u.freeChannels}</span>
            </div>
            {overflow && <div className="universe-warn">已超出容量</div>}
          </div>
        );
      })}
    </div>
  );
}
