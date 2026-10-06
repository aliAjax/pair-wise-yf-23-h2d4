/// <reference lib="webworker" />
import { computeAddressingPlan, type AddressingPlan } from "../utils/dmxAddressing";
import type { Fixture } from "../types/Fixture";

export interface AddressWorkerRequest {
  type: "COMPUTE_ADDRESSING";
  fixtures: Fixture[];
}

export interface AddressWorkerResponse {
  type: "ADDRESSING_RESULT";
  plan: AddressingPlan;
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<AddressWorkerRequest>) => {
  const { type, fixtures } = event.data;
  if (type === "COMPUTE_ADDRESSING") {
    const plan = computeAddressingPlan(fixtures);
    const response: AddressWorkerResponse = { type: "ADDRESSING_RESULT", plan };
    ctx.postMessage(response);
  }
};
