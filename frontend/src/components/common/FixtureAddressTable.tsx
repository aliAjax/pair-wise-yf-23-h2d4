import type { Fixture } from "../../types/Fixture";
import type { DmxLayout } from "../../types/DmxLayout";
import { ChannelModeText } from "../../constants/ChannelMode";
import { DmxBadge } from "./DmxBadge";
import { FixtureIcon } from "./FixtureIcon";

/** 灯具编址核对表：每盏灯的模式、通道数、宇宙/地址、锁定状态 */
export function FixtureAddressTable({
  fixtures,
  layout,
  selectedId,
  onSelect
}: {
  fixtures: Fixture[];
  layout: DmxLayout;
  selectedId: number | null;
  onSelect: (fixture: Fixture) => void;
}) {
  const placementById = new Map(layout.placements.map((p) => [p.fixture.id, p]));
  return (
    <div className="panel fixture-table-panel">
      <h2>编址排布明细（可核对）</h2>
      <div className="table-scroll">
        <table className="fixture-table">
          <thead>
            <tr>
              <th>编号</th><th>类型</th><th>通道模式</th><th>通道数</th><th>宇宙 / 地址</th><th>灯位</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture) => {
              const placement = placementById.get(fixture.id)!;
              return (
                <tr
                  key={fixture.id}
                  className={
                    (selectedId === fixture.id ? "selected" : "")
                    + (placement.status !== "PLACED" ? " unplaced-row" : "")
                  }
                  onClick={() => onSelect(fixture)}
                >
                  <td>{fixture.fixture_code}</td>
                  <td><FixtureIcon type={fixture.fixture_type} locked={fixture.address_locked} /> {fixture.fixture_type}</td>
                  <td>{ChannelModeText[fixture.channel_mode]} <span className="muted">v{fixture.mode_version}</span></td>
                  <td>{fixture.channel_count}</td>
                  <td>
                    <DmxBadge
                      universe={placement.universe}
                      startAddress={placement.startAddress}
                      endAddress={placement.endAddress}
                      status={placement.status}
                    />
                  </td>
                  <td>{fixture.address_locked ? "已锁定" : "自动"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
