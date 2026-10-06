import type { Fixture } from "../../types/Fixture";
import type { CueScene } from "../../types/CueScene";
import { FixtureIcon } from "./FixtureIcon";

export interface StageFixtureState {
  intensity: number;
  color: string;
}

/**
 * 二维舞台预览。有场景尚未算完（blocked）时只渲染静态灯位，
 * 不跟随播放时间点亮灯具——“没算完舞台预览不跟着播”。
 */
export function StageCanvas({
  fixtures,
  scenes,
  currentMs,
  blocked
}: {
  fixtures: Fixture[];
  scenes: CueScene[];
  currentMs: number;
  blocked: boolean;
}) {
  const activeScene = blocked
    ? null
    : scenes.find((scene) => {
        if (scene.scene_status !== "READY") return false;
        const start = 0;
        return currentMs >= start && currentMs <= start + scene.fade_in_ms + scene.hold_ms;
      });

  const activeIds = new Set(activeScene?.fixture_ids ?? []);

  return (
    <div className={"stage-canvas" + (blocked ? " blocked" : "")}>
      <div className="stage-curtain">舞台 · {blocked ? "场景重算中，预览冻结" : activeScene ? activeScene.name : "待机暗场"}</div>
      <div className="stage-plane">
        {fixtures.map((fixture) => {
          const lit = !blocked && activeIds.has(fixture.id);
          return (
            <span
              key={fixture.id}
              className={"stage-fixture" + (lit ? " lit" : "") + (fixture.address_locked ? " locked" : "")}
              style={{ left: fixture.position_x, top: fixture.position_y }}
              title={`${fixture.fixture_code} · ${fixture.channel_mode} · ${fixture.channel_count}ch`}
            >
              <FixtureIcon type={fixture.fixture_type} locked={fixture.address_locked} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
