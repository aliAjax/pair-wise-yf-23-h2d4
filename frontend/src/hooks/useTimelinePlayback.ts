import { useMemo, useState, useEffect } from "react";
import type { CueScene } from "../types/CueScene";
import { isAnySceneRecalculating, hasStaleScenes } from "../services/sceneService";

export interface TimelinePlaybackResult {
  playing: boolean;
  currentTimeMs: number;
  durationMs: number;
  canPlay: boolean;
  blockedReason: string | null;
  play: () => void;
  pause: () => void;
  seek: (timeMs: number) => void;
}

/**
 * 时间轴播放控制。场景未重算完时禁止播放。
 */
export function useTimelinePlayback(
  scenes: CueScene[] = [],
  durationMs: number = 0
): TimelinePlaybackResult {
  const [playing, setPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  const recalculating = isAnySceneRecalculating(scenes);
  const stale = hasStaleScenes(scenes);
  const canPlay = !recalculating && !stale;
  const blockedReason = recalculating
    ? "场景正在重算中，舞台预览暂不可播放"
    : stale
      ? "场景存在作废未重算，舞台预览暂不可播放"
      : null;

  useEffect(() => {
    if (!playing) return;
    const tick = window.setInterval(() => {
      setCurrentTimeMs((prev) => {
        if (prev >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return prev + 100;
      });
    }, 100);
    return () => window.clearInterval(tick);
  }, [playing, durationMs]);

  // 重算开始时自动暂停
  useEffect(() => {
    if (recalculating) setPlaying(false);
  }, [recalculating]);

  return {
    playing,
    currentTimeMs,
    durationMs,
    canPlay,
    blockedReason,
    play: () => canPlay && setPlaying(true),
    pause: () => setPlaying(false),
    seek: (timeMs) => setCurrentTimeMs(Math.min(Math.max(0, timeMs), durationMs))
  };
}
