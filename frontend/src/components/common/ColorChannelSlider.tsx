import type { ChannelMode } from "../../types/ChannelMode";
import { ChannelModeChannels } from "../../constants/ChannelMode";

/** 通道推子：按通道模式渲染对应数量的通道值滑杆 */
export function ColorChannelSlider({
  mode,
  values,
  disabled = false,
  onChange
}: {
  mode: ChannelMode;
  values: number[];
  disabled?: boolean;
  onChange?: (index: number, value: number) => void;
}) {
  const count = ChannelModeChannels[mode];
  return (
    <div className={"channel-slider" + (disabled ? " disabled" : "")}>
      {Array.from({ length: count }, (_, index) => (
        <label key={index}>
          <span>CH{index + 1}</span>
          <input
            type="range"
            min={0}
            max={255}
            value={values[index] ?? 0}
            disabled={disabled}
            onChange={(event) => onChange?.(index, Number(event.target.value))}
          />
          <em>{values[index] ?? 0}</em>
        </label>
      ))}
    </div>
  );
}
