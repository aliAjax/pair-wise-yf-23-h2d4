import { create } from "zustand";
import {
  commitFixtureModeChange,
  FixtureModeConflictError,
  listFixture,
  type ModeModePatch
} from "../api/Fixture";
import type { Fixture } from "../types/Fixture";
import type { ChannelMode } from "../types/ChannelMode";
import { useCueSceneStore } from "./CueSceneStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ChannelModeChannels } from "../constants/ChannelMode";

export interface ModeConflict {
  fixtureId: number;
  fixtureCode: string;
  expectedVersion: number;
  actualVersion: number;
  /** 晚到一版想改成的模式 */
  attemptedMode: ChannelMode;
  attemptedChannelCount: number;
  /** 先提交生效的一版 */
  currentMode: ChannelMode;
  currentChannelCount: number;
  message: string;
}

export interface FixtureLogEntry {
  at: string;
  level: "info" | "warn";
  text: string;
}

type ModeChangeOutcome =
  | { ok: true; fixture: Fixture; affectedSceneIds: number[] }
  | { ok: false; conflict: ModeConflict };

type State = {
  rows: Fixture[];
  loading: boolean;
  conflict: ModeConflict | null;
  logs: FixtureLogEntry[];
  load: () => Promise<void>;
  /** 两位灯光师同时改同一盏灯通道模式：先提交一版生效，晚到返回冲突差异 */
  changeChannelMode: (fixtureId: number, mode: ChannelMode, expectedVersion: number) => Promise<ModeChangeOutcome>;
  /** 演示用：模拟“另一位灯光师”抢先提交一版 */
  simulatePeerCommit: (fixtureId: number, mode: ChannelMode) => void;
  toggleAddressLock: (fixtureId: number) => void;
  dismissConflict: () => void;
};

const appendLog = (text: string, level: FixtureLogEntry["level"] = "info"): FixtureLogEntry =>
  ({ at: new Date().toISOString(), level, text });

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  conflict: null,
  logs: [],

  async load() {
    set({ loading: true });
    const rows = await listFixture();
    set({
      rows,
      loading: false,
      logs: [appendLog(`灯具清单载入完成，共 ${rows.length} 盏（含旧数据升级回填）`)]
    });
  },

  async changeChannelMode(fixtureId, channelMode, expectedVersion) {
    const current = get().rows.find((fixture) => fixture.id === fixtureId);
    if (!current) {
      return {
        ok: false,
        conflict: {
          fixtureId,
          fixtureCode: String(fixtureId),
          expectedVersion,
          actualVersion: 0,
          attemptedMode: channelMode,
          attemptedChannelCount: 0,
          currentMode: channelMode,
          currentChannelCount: 0,
          message: "灯具不存在"
        }
      };
    }

    const patch: Omit<ModeModePatch, "id"> = {
      channel_mode: channelMode,
      channel_count: current.channel_count,
      expected_version: expectedVersion
    };

    try {
      const result = commitFixtureModeChange(current, {
        ...patch,
        channel_count: requireChannelsFor(channelMode)
      });
      set((state) => ({
        rows: state.rows.map((fixture) => (fixture.id === fixtureId ? result.fixture : fixture)),
        logs: [
          appendLog(
            renderTemplate(LOG_TEMPLATES.Fixture[2], {
              fixtureCode: current.fixture_code,
              fromMode: current.channel_mode,
              toMode: channelMode,
              fromVersion: current.mode_version,
              toVersion: result.fixture.mode_version
            })
          ),
          ...state.logs
        ]
      }));
      const affectedSceneIds = useCueSceneStore
        .getState()
        .invalidateByFixture(fixtureId, current.fixture_code);
      return { ok: true, fixture: result.fixture, affectedSceneIds };
    } catch (error) {
      if (error instanceof FixtureModeConflictError) {
        const conflict: ModeConflict = {
          fixtureId,
          fixtureCode: error.fixtureCode,
          expectedVersion: error.expectedVersion,
          actualVersion: error.actual.mode_version,
          attemptedMode: error.attemptedMode,
          attemptedChannelCount: error.attemptedChannelCount,
          currentMode: error.actual.channel_mode,
          currentChannelCount: error.actual.channel_count,
          message: renderTemplate(`${ERROR_MESSAGE_FIXTURE_CONFLICT}`, {
            fixtureCode: error.fixtureCode,
            expectedVersion: error.expectedVersion,
            actualVersion: error.actual.mode_version
          })
        };
        set((state) => ({
          conflict,
          logs: [
            appendLog(
              renderTemplate(LOG_TEMPLATES.Fixture[3], {
                fixtureCode: error.fixtureCode,
                expectedVersion: error.expectedVersion,
                actualVersion: error.actual.mode_version
              }),
              "warn"
            ),
            ...state.logs
          ]
        }));
        return { ok: false, conflict };
      }
      throw error;
    }
  },

  simulatePeerCommit(fixtureId, mode) {
    const current = get().rows.find((fixture) => fixture.id === fixtureId);
    if (!current) return;
    const result = commitFixtureModeChange(current, {
      channel_mode: mode,
      channel_count: requireChannelsFor(mode),
      expected_version: current.mode_version
    });
    set((state) => ({
      rows: state.rows.map((fixture) => (fixture.id === fixtureId ? result.fixture : fixture)),
      logs: [
        appendLog(
          renderTemplate(LOG_TEMPLATES.Fixture[2], {
            fixtureCode: current.fixture_code,
            fromMode: current.channel_mode,
            toMode: mode,
            fromVersion: current.mode_version,
            toVersion: result.fixture.mode_version
          }) + "（另一位灯光师提交）"
        ),
        ...state.logs
      ]
    }));
    useCueSceneStore.getState().invalidateByFixture(fixtureId, current.fixture_code);
  },

  toggleAddressLock(fixtureId) {
    set((state) => ({
      rows: state.rows.map((fixture) =>
        fixture.id === fixtureId
          ? { ...fixture, address_locked: !fixture.address_locked }
          : fixture
      )
    }));
  },

  dismissConflict() {
    set({ conflict: null });
  }
}));

function requireChannelsFor(mode: ChannelMode): number {
  return ChannelModeChannels[mode];
}

const ERROR_MESSAGE_FIXTURE_CONFLICT = ERROR_MESSAGES.FIXTURE_MODE_CONFLICT;

function renderTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
