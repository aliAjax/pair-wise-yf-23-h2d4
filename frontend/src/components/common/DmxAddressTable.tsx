import type { Fixture } from "../../types/Fixture";
import type { AddressingPlan } from "../../utils/dmxAddressing";
import { ChannelMode, ChannelModeText, type ChannelMode as ChannelModeType } from "../../constants/ChannelMode";
import { FixtureIcon } from "./FixtureIcon";

interface Props {
  fixtures: Fixture[];
  plan: AddressingPlan | null;
  onToggleLock: (fixtureId: number) => void;
  onChannelModeChange: (fixtureId: number, mode: ChannelModeType) => void;
}

export function DmxAddressTable({ fixtures, plan, onToggleLock, onChannelModeChange }: Props) {
  const assignmentMap = new Map(plan?.assignments.map((a) => [a.fixtureId, a]) ?? []);

  return (
    <div className="table dmx-table">
      <div className="row dmx-row dmx-head">
        <span>灯具</span>
        <span>类型</span>
        <span>通道模式</span>
        <span>通道数</span>
        <span>宇宙</span>
        <span>DMX 地址</span>
        <span>状态</span>
      </div>
      {fixtures.map((f) => {
        const a = assignmentMap.get(f.id);
        return (
          <div key={f.id} className="row dmx-row">
            <div className="dmx-fixture">
              <FixtureIcon title={f.fixture_code} value={f.fixture_type} />
            </div>
            <span>{f.fixture_type}</span>
            <span>
              <select
                value={f.channel_mode}
                onChange={(e) => onChannelModeChange(f.id, e.target.value as ChannelModeType)}
              >
                {ChannelMode.map((m) => (
                  <option key={m} value={m}>{ChannelModeText[m]}</option>
                ))}
              </select>
            </span>
            <span>{f.channel_count}</span>
            <span>{a?.universe ?? f.universe}</span>
            <span className="dmx-address">
              {a?.dmxAddress ?? f.dmx_address}
              {a?.overflow && <span className="badge overflow-badge">排队</span>}
            </span>
            <span>
              <button
                className={`lock-btn ${f.dmx_address_locked ? "locked" : ""}`}
                onClick={() => onToggleLock(f.id)}
              >
                {f.dmx_address_locked ? "🔒 已锁定" : "🔓 未锁定"}
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
