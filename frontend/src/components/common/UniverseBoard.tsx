import type { DmxLayout } from "../../types/DmxLayout";
import { DMX_UNIVERSE_CAPACITY } from "../../constants/Dmx";
import { formatNumber, formatUniverseUsage } from "../../utils/formatters";
import { DmxBadge } from "./DmxBadge";
import { FixtureIcon } from "./FixtureIcon";

/** 宇宙编址核对板：逐宇宙列出占用、剩余、已排灯具地址区间 */
export function UniverseBoard({ layout }: { layout: DmxLayout }) {
  return (
    <div className="universe-board">
      {layout.universes.map((universe) => (
        <article key={universe.universe} className="panel universe-card">
          <header className="universe-head">
            <h3>宇宙 U{universe.universe}</h3>
            <span className="muted">容量 {DMX_UNIVERSE_CAPACITY}</span>
          </header>
          <div className="universe-meter" aria-label={`宇宙${universe.universe}占用`}>
            <i style={{ width: `${(universe.used / universe.capacity) * 100}%` }} />
          </div>
          <p className={universe.free === 0 ? "warn" : ""}>
            已用 {formatUniverseUsage(universe.used, universe.free)}
          </p>
          <ul className="universe-placed">
            {universe.placements.map((item) => (
              <li key={item.fixture.id} className={item.locked ? "locked-row" : ""}>
                <FixtureIcon type={item.fixture.fixture_type} locked={item.locked} />
                <span>{item.fixture.fixture_code}</span>
                <DmxBadge
                  universe={item.universe}
                  startAddress={item.startAddress}
                  endAddress={item.endAddress}
                  status={item.status}
                />
                <em>{item.locked ? "锁定原址" : `${item.fixture.channel_count} 通道`}</em>
              </li>
            ))}
            {universe.placements.length === 0 && <li className="muted">尚无灯具排入</li>}
          </ul>
        </article>
      ))}

      <article className="panel universe-card queue-card">
        <header className="universe-head">
          <h3>排队灯具（装不下，等下一宇宙）</h3>
          <span className="muted">{layout.unplaced.length} 盏</span>
        </header>
        <p className={layout.shortageChannels > 0 ? "danger" : ""}>
          通道合计 {formatNumber(layout.totalChannels)}；当前 {layout.universes.length} 个宇宙容量
          {layout.shortageChannels > 0
            ? `不足，还缺 ${formatNumber(layout.shortageChannels)} 个通道（需加开宇宙或减灯）`
            : "充足，无排队"}
        </p>
        <ul className="universe-placed">
          {layout.unplaced.map((item) => (
            <li key={item.fixture.id}>
              <FixtureIcon type={item.fixture.fixture_type} locked={item.locked} />
              <span>{item.fixture.fixture_code}</span>
              <DmxBadge
                universe={item.universe}
                startAddress={item.startAddress}
                endAddress={item.endAddress}
                status={item.status}
              />
              <em className="danger">
                {item.status === "TOO_LARGE"
                  ? `单灯 ${item.fixture.channel_count} 通道，超出单宇宙 ${DMX_UNIVERSE_CAPACITY}`
                  : `缺 ${item.fixture.channel_count} 通道`}
              </em>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
