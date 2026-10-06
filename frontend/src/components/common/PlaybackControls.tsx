import type { TimelinePlaybackResult } from "../../hooks/useTimelinePlayback";

interface Props {
  playback: TimelinePlaybackResult;
}

export function PlaybackControls({ playback }: Props) {
  const { playing, currentTimeMs, durationMs, canPlay, play, pause, seek } = playback;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="playback-controls">
      <button
        className="btn-primary"
        onClick={playing ? pause : play}
        disabled={!canPlay}
      >
        {playing ? "⏸ 暂停" : "▶ 播放"}
      </button>
      <input
        type="range"
        min={0}
        max={durationMs}
        value={currentTimeMs}
        onChange={(e) => seek(Number(e.target.value))}
        className="playback-seek"
      />
      <span className="playback-time">
        {formatTime(currentTimeMs)} / {formatTime(durationMs)}
      </span>
    </div>
  );
}
