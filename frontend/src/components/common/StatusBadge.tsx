import type { CueStatus } from "../../types/CueStatus";
import { CueStatusText } from "../../constants/CueStatus";

export function StatusBadge({ value }: { value: string }) {
  const text = (CueStatusText as Record<string, string>)[value as CueStatus]
    ?? String(value).replace(/_/g, " ");
  return <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>{text}</span>;
}
