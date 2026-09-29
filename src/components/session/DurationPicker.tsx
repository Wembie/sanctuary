import { useT } from '../../i18n';
import { Segmented } from '../ui/Segmented';
import styles from './Session.module.css';

/** Minutes, or null for "as long as I like". */
export type DurationChoice = number | null;

interface DurationPickerProps {
  label: string;
  presets: readonly DurationChoice[];
  value: DurationChoice;
  onChange: (value: DurationChoice) => void;
  /** Offer a free minutes field. */
  custom?: { min: number; max: number };
}

const keyOf = (value: DurationChoice): string => (value === null ? 'infinite' : String(value));

export function DurationPicker({ label, presets, value, onChange, custom }: DurationPickerProps) {
  const t = useT();
  const isPreset = presets.includes(value);
  const options = [
    ...presets.map((minutes) => ({
      value: keyOf(minutes),
      label: minutes === null ? '∞' : t.common.minutesShort(minutes),
      hint: minutes === null ? t.common.noEnd : undefined,
    })),
    ...(custom ? [{ value: 'custom', label: t.common.custom }] : []),
  ];

  const onSegment = (key: string) => {
    if (key === 'custom') onChange(isPreset ? 30 : value);
    else onChange(key === 'infinite' ? null : Number(key));
  };

  return (
    <div className={styles.picker}>
      <Segmented
        label={label}
        options={options}
        value={isPreset ? keyOf(value) : 'custom'}
        onChange={onSegment}
      />
      {custom && !isPreset && value !== null && (
        <label className={styles.customField}>
          <input
            type="number"
            inputMode="numeric"
            min={custom.min}
            max={custom.max}
            value={value}
            onChange={(e) => {
              const next = Math.round(Number(e.currentTarget.value));
              if (Number.isFinite(next)) onChange(Math.min(custom.max, Math.max(custom.min, next)));
            }}
          />
          <span>{t.common.minutes}</span>
        </label>
      )}
    </div>
  );
}
