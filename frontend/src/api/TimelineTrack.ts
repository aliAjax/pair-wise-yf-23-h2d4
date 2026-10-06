import { mockData } from "../mocks/seedData";
import type { TimelineTrack } from "../types/TimelineTrack";

const endpoint = "/api/timeline-track";

function toNumber(value: string | number, fallback: number): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalize(raw: Record<string, unknown>): TimelineTrack {
  return {
    id: raw.id as number,
    cue_scene_id: raw.cue_scene_id as number,
    start_ms: toNumber(raw.start_ms as string | number, 0),
    duration_ms: toNumber(raw.duration_ms as string | number, 0),
    layer: toNumber(raw.layer as string | number, 0),
    locked: raw.locked === true || raw.locked === "true"
  };
}

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return (mockData.timelineTrack as unknown as Record<string, unknown>[]).map(normalize);
}

export async function saveTimelineTrack(payload: TimelineTrack) {
  console.info("save TimelineTrack", payload);
  return payload;
}
