import { create } from "zustand";
import { listFixture, saveFixtureWithConflict } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";
import type { AddressingPlan } from "../utils/dmxAddressing";
import { computeAddressingPlan, applyAddressingPlan } from "../utils/dmxAddressing";
import { logAddressingComplete, logChannelModeChange } from "../services/fixtureService";
import type { ConflictResult } from "../utils/conflict";
import { eventBus, FIXTURE_CHANNEL_MODE_CHANGED } from "../utils/eventBus";

type State = {
  rows: Fixture[];
  loading: boolean;
  addressingPlan: AddressingPlan | null;
  saving: boolean;
  conflict: ConflictResult | null;
  load: () => Promise<void>;
  recomputeAddressing: () => void;
  applyAddressing: () => void;
  updateFixtureChannelMode: (fixtureId: number, channelMode: Fixture["channel_mode"]) => Promise<{ ok: boolean; conflict?: ConflictResult }>;
  clearConflict: () => void;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  addressingPlan: null,
  saving: false,
  conflict: null,

  async load() {
    set({ loading: true });
    const rows = await listFixture();
    set({ rows, loading: false });
    get().recomputeAddressing();
  },

  recomputeAddressing() {
    const plan = computeAddressingPlan(get().rows);
    set({ addressingPlan: plan });
    logAddressingComplete(plan.assignments.length, plan.universes.length);
  },

  applyAddressing() {
    const { rows, addressingPlan } = get();
    if (!addressingPlan) return;
    const updated = applyAddressingPlan(rows, addressingPlan);
    set({ rows: updated });
    get().recomputeAddressing();
  },

  async updateFixtureChannelMode(fixtureId, channelMode) {
    const { rows } = get();
    const current = rows.find((f) => f.id === fixtureId);
    if (!current) return { ok: false };

    const previousMode = current.channel_mode;
    const incoming: Fixture = {
      ...current,
      channel_mode: channelMode,
      channel_count: channelMode === "DIMMER_ONLY" ? 1 : channelMode === "RGB" ? 3 : channelMode === "RGBW" ? 4 : 16
    };

    set({ saving: true });
    const result = await saveFixtureWithConflict(current, incoming, current.version);
    set({ saving: false });

    if (!result.ok || result.conflict) {
      set({ conflict: result.conflict ?? null });
      return { ok: false, conflict: result.conflict };
    }

    logChannelModeChange(result.fixture!, previousMode);
    const updated = rows.map((f) => (f.id === fixtureId ? result.fixture! : f));
    set({ rows: updated });
    get().recomputeAddressing();
    eventBus.emit(FIXTURE_CHANNEL_MODE_CHANGED, { fixtureId, channelMode });
    return { ok: true };
  },

  clearConflict() {
    set({ conflict: null });
  }
}));
