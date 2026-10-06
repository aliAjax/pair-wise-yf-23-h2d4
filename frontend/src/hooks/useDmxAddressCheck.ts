import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import { computeAddressingPlan, DMX_UNIVERSE_CAPACITY, type AddressingPlan } from "../utils/dmxAddressing";

export interface DmxAddressCheckResult {
  plan: AddressingPlan;
  totalFixtures: number;
  totalChannels: number;
  universeCount: number;
  overflowCount: number;
  collisionCount: number;
  missingChannels: number;
  hasOverflow: boolean;
  hasCollision: boolean;
  universeCapacity: number;
}

/**
 * 检查灯具 DMX 地址排布：
 * - 单个宇宙容量 512，装不下排队到下一宇宙；
 * - 已锁定灯位留在原址；
 * - 返回可核对的排布结果（溢出数量、冲突数量、还缺多少通道）。
 */
export function useDmxAddressCheck(fixtures: Fixture[] = []): DmxAddressCheckResult {
  return useMemo(() => {
    const plan = computeAddressingPlan(fixtures);
    return {
      plan,
      totalFixtures: plan.assignments.length,
      totalChannels: plan.totalChannels,
      universeCount: plan.universes.length,
      overflowCount: plan.overflowCount,
      collisionCount: plan.collisionCount,
      missingChannels: plan.missingChannels,
      hasOverflow: plan.overflowCount > 0,
      hasCollision: plan.collisionCount > 0,
      universeCapacity: DMX_UNIVERSE_CAPACITY
    };
  }, [fixtures]);
}
