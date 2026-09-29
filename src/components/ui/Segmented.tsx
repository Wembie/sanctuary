import { useId, useRef, type KeyboardEvent } from 'react';
import styles from './controls.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'regular' | 'small';
}

/** A radio group that looks like a quiet row of words. Arrow keys move between options. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  size = 'regular',
}: SegmentedProps<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={id} className={styles.segmented} data-size={size}>
      <span id={id} className="sr-only">
        {label}
      </span>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.segment}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            title={option.hint}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
