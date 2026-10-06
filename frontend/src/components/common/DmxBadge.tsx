import type { PlacementStatus } from "../../types/DmxLayout";
import { formatDmxAddress } from "../../utils/formatters";

/** DMX 编址徽标：已排入显示 宇宙.地址区间；排队显示缺口 */
export function DmxBadge({
  universe,
  startAddress,
  endAddress,
  status
}: {
  universe: number | null;
  startAddress: number | null;
  endAddress: number | null;
  status: PlacementStatus;
}) {
  if (universe === null || startAddress === null) {
    return <span className={"dmx-badge " + status.toLowerCase()}>排队中</span>;
  }
  const range = startAddress === endAddress
    ? formatDmxAddress(universe, startAddress)
    : `U${universe}.${startAddress}-${endAddress}`;
  return <span className="dmx-badge placed">{range}</span>;
}
