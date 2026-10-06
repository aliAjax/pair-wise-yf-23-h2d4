import type { CueScene } from "../../types/CueScene";

/** 时间轴标尺 + 播放控制；blocked 时禁用播放按钮 */
export function TimelineRuler({
  durationMs,
  currentMs,
  playing,
  blocked,
  scenes,
  onPlay,
  onPause,
  onSeek
}: {
  durationMs: number;
  currentMs: number;
  playing: boolean;
  blocked: boolean;
  scenes: CueScene[];
  onPlay: () => void;
  onPause: () => void;
  onSeek: (ms: number) => void;
}) {
  const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  return (
    <section className="panel timeline-ruler">
      <div className="ruler-controls">
        <button className="primary" onClick={playing ? onPause : onPlay} disabled={blocked}>
          {playing ? "暂停" : "播放"}
        </button>
        <button onClick={() => onSeek(0)} disabled={blocked}>回到起点</button>
        <strong>{seconds(currentMs)} / {seconds(durationMs)}</strong>
        {blocked && <span className="warn">场景重算未完成，已禁止播放</span>}
      </div>
      <input
        type="range"
        min={0}
        max={durationMs}
        value={currentMs}
        disabled={blocked}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <div className="ruler-track">
        {scenes.map((scene, index) => {
          const start = index === 0 ? 0 : scenes.slice(0, index).reduce(
            (sum, prev) => sum + prev.fade_in_ms + prev.hold_ms + 200, 0
          );
          const width = ((scene.fade_in_ms + scene.hold_ms) / durationMs) * 100;
          return (
            <span
              key={scene.id}
              className={"ruler-clip status-" + scene.scene_status.toLowerCase()}
              style={{ left: `${(start / durationMs) * 100}%`, width: `${width}%` }}
              title={`${scene.name} · ${scene.scene_status}`}
            >
              {scene.name}
            </span>
          );
        })}
        <i className="ruler-cursor" style={{ left: `${(currentMs / durationMs) * 100}%` }} />
      </div>
    </section>
  );
}
