import type { FixtureType } from "../../types/FixtureType";

const TYPE_GLYPH: Record<string, string> = {
  PAR: "▮",
  SPOT: "◎",
  WASH: "▦",
  BEAM: "▲",
  STROBE: "⚡"
};

export function FixtureIcon({ type, locked = false }: { type: string; locked?: boolean }) {
  const glyph = TYPE_GLYPH[type as FixtureType] ?? "●";
  return (
    <span className={"fixture-icon" + (locked ? " locked" : "")} title={locked ? "灯位已锁定" : type}>
      {glyph}
    </span>
  );
}
