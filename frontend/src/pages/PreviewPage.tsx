import { useEffect, useMemo } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { StageCanvas } from "../components/common/StageCanvas";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { StatusBadge } from "../components/common/StatusBadge";

const TIMELINE_MS = 15200;

export function PreviewPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const loadFixtures = useFixtureStore((state) => state.load);
  const { rows: scenes, recalculating, load: loadScenes } = useCueSceneStore();

  useEffect(() => {
    void loadFixtures();
    void loadScenes();
  }, [loadFixtures, loadScenes]);

  // 有场景没算完时 blocked=true：播放不会启动，已在播放会立即暂停
  const playback = useTimelinePlayback(TIMELINE_MS, recalculating);

  const pendingCount = useMemo(
    () => scenes.filter((s) => s.scene_status === "OUTDATED" || s.scene_status === "RECALCULATING").length,
    [scenes]
  );

  return (
    <main className="page preview-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light · 预览</p>
          <h1>舞台预览</h1>
          <p className="muted">引用灯具的场景未重算完成前，舞台预览冻结，不跟随时间播放。</p>
        </div>
        <StatusBadge value={recalculating ? "RECALCULATING" : "READY"} />
      </section>

      {recalculating && (
        <div className="panel blocked-banner">
          <strong>通道模式改动后场景重算中（{pendingCount} 个场景）</strong>
          <span>灯光输出暂停，等全部算完自动恢复可播放。</span>
        </div>
      )}

      <StageCanvas fixtures={fixtures} scenes={scenes} currentMs={playback.currentMs} blocked={recalculating} />
      <TimelineRuler
        durationMs={TIMELINE_MS}
        currentMs={playback.currentMs}
        playing={playback.playing}
        blocked={recalculating}
        scenes={scenes}
        onPlay={playback.play}
        onPause={playback.pause}
        onSeek={playback.seek}
      />
    </main>
  );
}
