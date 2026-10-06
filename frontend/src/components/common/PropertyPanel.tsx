import { useEffect, useState } from "react";
import type { Fixture } from "../../types/Fixture";
import { ChannelMode, ChannelModeChannels, ChannelModeText, type ChannelMode as ChannelModeType } from "../../constants/ChannelMode";
import { FixtureIcon } from "./FixtureIcon";
import { DmxBadge } from "./DmxBadge";

/**
 * 灯具属性面板：
 * - 修改通道模式（带版本号，晚到提交会被服务端判定冲突）；
 * - 锁定/解锁灯位；
 * - “模拟另一位灯光师先提交”用于演示两人同时改一盏灯。
 */
export function PropertyPanel({
  fixture,
  placement,
  onSubmitMode,
  onToggleLock,
  onPeerCommit,
  saving,
  refreshKey = 0
}: {
  fixture: Fixture | null;
  placement?: { universe: number | null; startAddress: number | null; endAddress: number | null; status: "PLACED" | "TOO_LARGE" | "UNIVERSE_EXHAUSTED" };
  onSubmitMode: (mode: ChannelModeType, expectedVersion: number) => void;
  onToggleLock: () => void;
  onPeerCommit: (mode: ChannelModeType) => void;
  saving: boolean;
  refreshKey?: number;
}) {
  const [draft, setDraft] = useState<ChannelModeType>("RGB");
  const [baseVersion, setBaseVersion] = useState(1);

  useEffect(() => {
    if (fixture) {
      setDraft(fixture.channel_mode);
      setBaseVersion(fixture.mode_version);
    }
    // refreshKey：冲突后用“已生效版本”强制同步草稿
  }, [fixture, refreshKey]);

  if (!fixture) {
    return <aside className="panel property-panel"><h2>灯具属性</h2><p className="muted">在左侧列表或平面图中选择一盏灯。</p></aside>;
  }

  return (
    <aside className="panel property-panel">
      <h2>灯具属性</h2>
      <div className="property-head">
        <FixtureIcon type={fixture.fixture_type} locked={fixture.address_locked} />
        <div>
          <strong>{fixture.fixture_code}</strong>
          <span className="muted">{fixture.fixture_type} · #{fixture.id}</span>
        </div>
        {placement && <DmxBadge {...placement} />}
      </div>

      <dl className="property-list">
        <dt>通道模式（当前版本 v{fixture.mode_version}）</dt>
        <dd>
          <select value={draft} onChange={(event) => setDraft(event.target.value as ChannelModeType)}>
            {ChannelMode.map((mode) => (
              <option key={mode} value={mode}>
                {ChannelModeText[mode]}（{ChannelModeChannels[mode]} 通道）
              </option>
            ))}
          </select>
        </dd>
        <dt>通道数（模式一改即重算）</dt>
        <dd>{ChannelModeChannels[draft]}（当前 {fixture.channel_count}）</dd>
        <dt>灯位</dt>
        <dd>X {fixture.position_x} · Y {fixture.position_y}</dd>
      </dl>

      <div className="property-actions">
        <button
          className="primary"
          disabled={saving || (draft === fixture.channel_mode && baseVersion === fixture.mode_version)}
          onClick={() => onSubmitMode(draft, baseVersion)}
        >
          提交通道模式
        </button>
        <button onClick={onToggleLock}>
          {fixture.address_locked ? "解锁灯位" : "锁定灯位（留在原址）"}
        </button>
      </div>

      <div className="peer-box">
        <p className="muted">两人同时修改演示：下面的操作模拟另一位灯光师抢先提交一版，随后再点“提交通道模式”即会被判为晚到。</p>
        <button className="ghost" onClick={() => onPeerCommit(pickPeerMode(fixture.channel_mode))}>
          模拟同事先提交为 {ChannelModeText[pickPeerMode(fixture.channel_mode)]}
        </button>
      </div>
    </aside>
  );
}

function pickPeerMode(mode: ChannelModeType): ChannelModeType {
  const index = ChannelMode.indexOf(mode);
  return ChannelMode[(index + 1) % ChannelMode.length];
}
