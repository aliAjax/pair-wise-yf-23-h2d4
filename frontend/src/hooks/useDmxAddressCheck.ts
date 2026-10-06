import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import type { DmxLayout } from "../types/DmxLayout";
import { planDmxLayout } from "../utils/dmxLayout";

/**
 * DMX 编址核对：输入当前灯具列表，输出可核对的排布。
 * - 每个宇宙的占用/剩余；
 * - 已锁定灯位原址保留，其余按通道数自动补齐；
 * - 装不下的排队，并汇总还缺多少通道。
 */
export function useDmxAddressCheck(fixtures: Fixture[] = []): DmxLayout {
  return useMemo(() => planDmxLayout(fixtures), [fixtures]);
}
