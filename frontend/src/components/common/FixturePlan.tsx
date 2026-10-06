import type { Fixture } from "../../types/Fixture";
import type { DmxLayout } from "../../types/DmxLayout";
import { FixtureIcon } from "./FixtureIcon";

/** 灯具平面图：灯位按坐标排布，排队灯具红色描边，锁定灯位带角标 */
export function FixturePlan({
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
  const statusById = new Map(layout.placements.map((p) => [p.fixture.id, p.status]));
  return (
    <div className="panel fixture-plan">
      <h2>灯具平面图</h2>
      <div className="plan-plane">
        {fixtures.map((fixture) => {
          const status = statusById.get(fixture.id);
          return (
            <button
              key={fixture.id}
              type="button"
              className={
                "plan-dot"
                + (selectedId === fixture.id ? " selected" : "")
                + (status && status !== "PLACED" ? " unplaced" : "")
              }
              style={{ left: fixture.position_x, top: fixture.position_y }}
              title={`${fixture.fixture_code} · ${fixture.channel_mode} · ${fixture.channel_count}ch${fixture.address_locked ? " · 锁定" : ""}`}
              onClick={() => onSelect(fixture)}
            >
              <FixtureIcon type={fixture.fixture_type} locked={fixture.address_locked} />
            </button>
          );
        })}
      </div>
      <p className="muted">提示：带锁角标的灯位已锁定，自动编址会保留原址；红色为超出宇宙容量、正在排队的灯具。</p>
    </div>
  );
}
