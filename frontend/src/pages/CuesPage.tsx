import { useEffect } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { CueCard } from "../components/common/CueCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";

export function CuesPage() {
  const { rows, loading, load, recalculating } = useCueSceneStore();
  const fixtures = useFixtureStore((state) => state.rows);
  const loadFixtures = useFixtureStore((state) => state.load);

  useEffect(() => {
    void load();
    if (fixtures.length === 0) void loadFixtures();
  }, [load, loadFixtures, fixtures.length]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light · 场景</p>
          <h1>场景编辑</h1>
          <p className="muted">灯具通道模式一改动，引用它的场景立即作废（OUTDATED）并重算，重算期间不可用于预览。</p>
        </div>
        {recalculating && <StatusBadge value="RECALCULATING" />}
      </section>
      {loading && rows.length === 0 ? <EmptyState title="场景载入中…" /> : (
        <section className="cue-grid">
          {rows.map((scene) => (
            <CueCard
              key={scene.id}
              scene={scene}
              fixtureCount={scene.fixture_ids.length}
              knownFixtures={fixtures.length}
            />
          ))}
        </section>
      )}
    </main>
  );
}
