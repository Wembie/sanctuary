import styles from './controls.module.css';

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ label, description, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles.switchRow}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchText}>
        <span>{label}</span>
        {description && <span className={styles.switchDescription}>{description}</span>}
      </span>
      <span className={styles.switchTrack} data-on={checked || undefined} aria-hidden="true">
        <span className={styles.switchThumb} />
      </span>
    </button>
  );
}
