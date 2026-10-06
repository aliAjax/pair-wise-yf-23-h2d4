import { useEffect, useCallback } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useDmxAddressCheck } from "../hooks/useDmxAddressCheck";
import { DmxAddressTable } from "../components/common/DmxAddressTable";
import { UniverseSummaryPanel } from "../components/common/UniverseSummary";
import { ConflictBanner } from "../components/common/ConflictBanner";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import type { ChannelMode } from "../constants/ChannelMode";

export function FixturesPage() {
  const {
    rows: fixtures,
    loading,
    addressingPlan,
    conflict,
    load: loadFixtures,
    applyAddressing,
    updateFixtureChannelMode,
    clearConflict
  } = useFixtureStore();

  const {
    rows: scenes,
    recalculating,
    load: loadScenes,
    recalculateStale,
    hasStale
  } = useCueSceneStore();

  const check = useDmxAddressCheck(fixtures);

  useEffect(() => {
    void loadFixtures();
    void loadScenes();
  }, [loadFixtures, loadScenes]);

  const handleToggleLock = useCallback(
    (fixtureId: number) => {
      const target = fixtures.find((f) => f.id === fixtureId);
      if (!target) return;
      const updated = fixtures.map((f) =>
        f.id === fixtureId ? { ...f, dmx_address_locked: !f.dmx_address_locked } : f
      );
      useFixtureStore.setState({ rows: updated });
      useFixtureStore.getState().recomputeAddressing();
    },
    [fixtures]
  );

  const handleChannelModeChange = useCallback(
    async (fixtureId: number, mode: ChannelMode) => {
      const result = await updateFixtureChannelMode(fixtureId, mode);
      if (!result.ok && result.conflict) {
        // 冲突已由 store 记录，页面展示差异
      }
    },
    [updateFixtureChannelMode]
  );

  const handleRecalculate = useCallback(async () => {
    await recalculateStale(fixtures);
  }, [recalculateStale, fixtures]);

  const stale = hasStale();

  if (loading) {
    return <section className="page"><p>加载中…</p></section>;
  }

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>灯具布置</h1>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={applyAddressing}>应用自动编址</button>
          <button
            className="btn-primary"
            onClick={handleRecalculate}
            disabled={recalculating || !stale}
          >
            {recalculating ? "重算中…" : "重算作废场景"}
          </button>
        </div>
      </header>

      {conflict && (
        <ConflictBanner
          conflict={conflict}
          onDismiss={clearConflict}
          onAcceptTheirs={clearConflict}
        />
      )}

      <section className="metrics">
        <StatCard label="灯具总数" value={check.totalFixtures} />
        <StatCard label="总通道数" value={check.totalChannels} />
        <StatCard label="宇宙数" value={check.universeCount} />
        <StatCard label="排队溢出" value={check.overflowCount} />
        <StatCard label="空闲通道（还缺）" value={check.missingChannels} />
        <StatCard label="地址冲突" value={check.collisionCount} />
      </section>

      {stale && (
        <div className="stale-banner">
          <strong>⚠️ 有 {scenes.filter((s) => s.stale).length} 个场景因通道模式变更而作废</strong>
          <span>舞台预览在重算完成前不会播放</span>
        </div>
      )}

      <section className="workbench">
        <div className="panel wide">
          <h2>宇宙通道排布</h2>
          <UniverseSummaryPanel universes={check.plan.universes} />
        </div>
      </section>

      <section className="panel">
        <h2>灯具编址表</h2>
        {fixtures.length === 0 ? (
          <EmptyState title="暂无灯具" />
        ) : (
          <DmxAddressTable
            fixtures={fixtures}
            plan={addressingPlan}
            onToggleLock={handleToggleLock}
            onChannelModeChange={handleChannelModeChange}
          />
        )}
      </section>
    </section>
  );
}
