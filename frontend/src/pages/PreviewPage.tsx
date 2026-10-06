import { useEffect } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { StageCanvas } from "../components/common/StageCanvas";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { EmptyState } from "../components/common/EmptyState";

export function PreviewPage() {
  const { rows: fixtures, load: loadFixtures } = useFixtureStore();
  const { rows: scenes, recalculating, load: loadScenes } = useCueSceneStore();
  const { rows: tracks, load: loadTracks } = useTimelineTrackStore();

  const durationMs = tracks.reduce((max, t) => Math.max(max, t.start_ms + t.duration_ms), 0);
  const playback = useTimelinePlayback(scenes, durationMs);

  useEffect(() => {
    void loadFixtures();
    void loadScenes();
    void loadTracks();
  }, [loadFixtures, loadScenes, loadTracks]);

  if (recalculating) {
    return (
      <section className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">stage-light</p>
            <h1>舞台预览</h1>
          </div>
        </header>
        <div className="recalculating-banner">
          <strong>⏳ 场景正在重算中，舞台预览暂不播放</strong>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>舞台预览</h1>
        </div>
      </header>

      <section className="panel">
        <h2>舞台</h2>
        {fixtures.length === 0 ? (
          <EmptyState title="暂无灯具" />
        ) : (
          <StageCanvas title="StageCanvas" value={playback.playing ? "PLAYING" : "READY"} />
        )}
      </section>

      <section className="panel">
        <h2>播放控制</h2>
        <PlaybackControls playback={playback} />
        {playback.blockedReason && (
          <div className="blocked-reason">⚠️ {playback.blockedReason}</div>
        )}
      </section>
    </section>
  );
}
