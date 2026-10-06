import { useEffect, useMemo, useState } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import type { Fixture } from "../types/Fixture";
import type { ChannelMode } from "../types/ChannelMode";
import { DMX_MAX_UNIVERSES, DMX_UNIVERSE_CAPACITY } from "../constants/Dmx";
import { StatCard } from "../components/common/StatCard";
import { PropertyPanel } from "../components/common/PropertyPanel";
import { UniverseBoard } from "../components/common/UniverseBoard";
import { FixturePlan } from "../components/common/FixturePlan";
import { FixtureAddressTable } from "../components/common/FixtureAddressTable";
import { ConflictNotice } from "../components/common/ConflictNotice";
import { formatDate } from "../utils/formatters";

export function FixturesPage() {
  const {
    rows, loading, load, changeChannelMode, simulatePeerCommit,
    toggleAddressLock, conflict, dismissConflict
  } = useFixtureStore();
  const recalculating = useCueSceneStore((state) => state.recalculating);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const layout = useDmxAddressCheck(rows);
  const selected = useMemo(
    () => rows.find((fixture) => fixture.id === selectedId) ?? null,
    [rows, selectedId]
  );
  const selectedPlacement = layout.placements.find((p) => p.fixture.id === selectedId);
  const lockedCount = rows.filter((fixture) => fixture.address_locked).length;

  const handleSubmitMode = async (mode: ChannelMode, expectedVersion: number) => {
    if (!selected) return;
    setSaving(true);
    await changeChannelMode(selected.id, mode, expectedVersion);
    setSaving(false);
  };

  const handleSelect = (fixture: Fixture) => setSelectedId(fixture.id);

  return (
    <main className="page fixtures-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light · DMX 编址</p>
          <h1>灯具布置</h1>
          <p className="muted">
            单宇宙容量 {DMX_UNIVERSE_CAPACITY}，本场馆 {DMX_MAX_UNIVERSES} 个宇宙；
            已锁定灯位留在原址，其余按通道数自动补齐，装不下排队并写明缺口。
          </p>
        </div>
        {recalculating && <span className="badge recalculating">引用场景重算中，舞台预览暂停</span>}
      </section>

      {conflict && (
        <ConflictNotice
          conflict={conflict}
          onDismiss={dismissConflict}
          onRefresh={() => {
            dismissConflict();
            if (selected) setSelectedId(selected.id);
          }}
        />
      )}

      <section className="metrics">
        <StatCard label="灯具总数" value={rows.length} />
        <StatCard label="已锁定灯位" value={lockedCount} />
        <StatCard label="排队灯具" value={layout.unplaced.length} />
        <StatCard label="通道缺口" value={layout.shortageChannels} />
      </section>

      <section className="fixtures-grid">
        <div className="fixtures-main">
          <FixturePlan fixtures={rows} layout={layout} selectedId={selectedId} onSelect={handleSelect} />
          <UniverseBoard layout={layout} />
          <FixtureAddressTable fixtures={rows} layout={layout} selectedId={selectedId} onSelect={handleSelect} />
          <OperationLog />
        </div>
        <PropertyPanel
          fixture={selected}
          refreshKey={conflict && conflict.fixtureId === selectedId ? conflict.actualVersion : 0}
          placement={selectedPlacement && {
            universe: selectedPlacement.universe,
            startAddress: selectedPlacement.startAddress,
            endAddress: selectedPlacement.endAddress,
            status: selectedPlacement.status
          }}
          saving={saving || loading}
          onSubmitMode={handleSubmitMode}
          onToggleLock={() => selected && toggleAddressLock(selected.id)}
          onPeerCommit={(mode) => selected && simulatePeerCommit(selected.id, mode)}
        />
      </section>
    </main>
  );
}

function OperationLog() {
  const fixtureLogs = useFixtureStore((state) => state.logs);
  const sceneLogs = useCueSceneStore((state) => state.logs);
  const rows = [
    ...fixtureLogs.map((entry) => ({ at: entry.at, text: entry.text, level: entry.level })),
    ...sceneLogs.map((entry) => ({
      at: entry.at,
      level: entry.done ? "info" as const : "warn" as const,
      text: `场景「${entry.sceneName}」${entry.done ? "重算完成" : "已作废，开始重算"}（灯具 #${entry.fixtureId}）`
    }))
  ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);

  return (
    <div className="panel">
      <h2>操作日志</h2>
      <ul className="log-list">
        {rows.length === 0 && <li className="muted">暂无操作</li>}
        {rows.map((row, index) => (
          <li key={index} className={row.level === "warn" ? "warn" : ""}>
            <time>{formatDate(row.at)}</time><span>{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
