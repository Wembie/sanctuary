import type { CSSProperties } from 'react';
import { useT } from '../../i18n';
import styles from './controls.module.css';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Human text for screen readers, e.g. "70 percent". */
  valueText?: string;
  showLabel?: boolean;
  disabled?: boolean;
}

/** A thin, quiet range input. Keyboard and screen reader behavior comes from the native element. */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  valueText,
  showLabel = false,
  disabled,
}: SliderProps) {
  const t = useT();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className={styles.slider} data-disabled={disabled || undefined}>
      <span className={showLabel ? styles.sliderLabel : 'sr-only'}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText ?? t.common.percent(Math.round(fill))}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={{ '--fill': `${fill}%` } as CSSProperties}
      />
    </label>
  );
}
