import { useEffect } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";

export function TimelinePage() {
  const scenes = useCueSceneStore((state) => state.rows);
  const recalculating = useCueSceneStore((state) => state.recalculating);
  const loadScenes = useCueSceneStore((state) => state.load);
  const { rows: tracks, load: loadTracks } = useTimelineTrackStore();

  useEffect(() => {
    void loadScenes();
    void loadTracks();
  }, [loadScenes, loadTracks]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light · 时间轴</p>
          <h1>时间轴编排</h1>
          <p className="muted">锁定轨道不参与拖拽；通道模式重算期间时间轴不允许播放。</p>
        </div>
        {recalculating && <StatusBadge value="RECALCULATING" />}
      </section>
      <section className="panel">
        <h2>轨道列表</h2>
        {tracks.length === 0 ? <EmptyState /> : (
          <table className="fixture-table">
            <thead><tr><th>轨道</th><th>场景</th><th>起始</th><th>时长</th><th>层级</th><th>锁定</th></tr></thead>
            <tbody>
              {tracks.map((track) => {
                const scene = scenes.find((item) => item.id === track.cue_scene_id);
                return (
                  <tr key={track.id}>
                    <td>#{track.id}</td>
                    <td>{scene?.name ?? `场景 ${track.cue_scene_id}`}{scene && <StatusBadge value={scene.scene_status} />}</td>
                    <td>{track.start_ms}ms</td>
                    <td>{track.duration_ms}ms</td>
                    <td>L{track.layer}</td>
                    <td>{track.locked ? "已锁定" : "可拖拽"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
