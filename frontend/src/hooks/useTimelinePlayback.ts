import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 时间轴播放。blocked 为 true（有场景没算完）时：
 * - 正在播放立即暂停；
 * - play() 不会启动，舞台预览不跟着播。
 */
export function useTimelinePlayback(durationMs: number, blocked: boolean) {
  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    setPlaying(false);
    lastTsRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (blocked) return;
    setPlaying((prev) => {
      if (prev) return prev;
      lastTsRef.current = null;
      return true;
    });
  }, [blocked]);

  useEffect(() => {
    if (!playing) return;
    if (blocked) {
      stop();
      return;
    }
    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;
      setCurrentMs((prev) => {
        const next = prev + delta;
        if (next >= durationMs) {
          stop();
          return durationMs;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return stop;
  }, [playing, blocked, durationMs, stop]);

  const seek = useCallback((ms: number) => {
    setCurrentMs(Math.max(0, Math.min(durationMs, ms)));
  }, [durationMs]);

  return { currentMs, playing, play, pause: stop, seek, blocked };
}
