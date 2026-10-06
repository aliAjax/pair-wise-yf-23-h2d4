import type { CueScene } from "../../types/CueScene";
import { StatusBadge } from "./StatusBadge";

export function CueCard({
  scene,
  fixtureCount,
  knownFixtures
}: {
  scene: CueScene;
  fixtureCount: number;
  knownFixtures: number;
}) {
  return (
    <article className={"panel cue-card status-" + scene.scene_status.toLowerCase()}>
      <header>
        <h2>{scene.name}</h2>
        <StatusBadge value={scene.scene_status} />
      </header>
      <dl>
        <dt>引用灯具</dt><dd>{fixtureCount} 盏{knownFixtures > 0 ? ` / 共 ${knownFixtures}` : ""}</dd>
        <dt>淡入 / 保持</dt><dd>{scene.fade_in_ms}ms / {scene.hold_ms}ms</dd>
        <dt>优先级</dt><dd>{scene.priority}</dd>
      </dl>
      {(scene.scene_status === "OUTDATED" || scene.scene_status === "RECALCULATING") && (
        <p className="warn">灯具通道模式已改动，场景通道指令重新计算中，完成前预览不播放。</p>
      )}
    </article>
  );
}
