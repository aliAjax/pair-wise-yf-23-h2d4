import { useEffect } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { CueCard } from "../components/common/CueCard";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatStatus } from "../utils/formatters";

export function CuesPage() {
  const { rows: scenes, loading, load } = useCueSceneStore();
  const { rows: fixtures, load: loadFixtures } = useFixtureStore();

  useEffect(() => {
    void load();
    void loadFixtures();
  }, [load, loadFixtures]);

  if (loading) return <section className="page"><p>加载中…</p></section>;

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>场景编辑</h1>
        </div>
      </header>

      <section className="panel">
        <h2>灯光场景</h2>
        {scenes.length === 0 ? (
          <EmptyState title="暂无场景" />
        ) : (
          <div className="cue-grid">
            {scenes.map((scene) => (
              <div key={scene.id} className="cue-card-wrapper">
                <CueCard title={scene.name} value={formatStatus(scene.scene_status)} />
                <div className="cue-meta">
                  <StatusBadge value={scene.scene_status} />
                  {scene.stale && <span className="badge stale-badge">已作废</span>}
                  {scene.recalculating && <span className="badge recalc-badge">重算中</span>}
                </div>
                <div className="cue-fixtures">
                  引用灯具：{scene.fixture_states.map((s) => s.fixture_id).join("、") || "无"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
