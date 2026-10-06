import { useEffect } from "react";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatStatus } from "../utils/formatters";

export function TimelinePage() {
  const { rows: tracks, loading, load } = useTimelineTrackStore();
  const { rows: scenes, load: loadScenes } = useCueSceneStore();

  useEffect(() => {
    void load();
    void loadScenes();
  }, [load, loadScenes]);

  if (loading) return <section className="page"><p>加载中…</p></section>;

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>时间轴编排</h1>
        </div>
      </header>

      <section className="panel">
        <h2>时间轴轨道</h2>
        <TimelineRuler title="TimelineRuler" value="READY" />
        {tracks.length === 0 ? (
          <EmptyState title="暂无轨道" />
        ) : (
          <div className="track-list">
            {tracks.map((track) => {
              const scene = scenes.find((s) => s.id === track.cue_scene_id);
              return (
                <div key={track.id} className="track-row">
                  <span className="track-time">{track.start_ms}ms</span>
                  <span className="track-name">{scene?.name ?? "未知道场"}</span>
                  <span className="track-duration">{track.duration_ms}ms</span>
                  <span className="track-layer">层 {track.layer}</span>
                  <StatusBadge value={track.locked ? "LOCKED" : "UNLOCKED"} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
