import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useT } from '../../i18n';
import { Icon } from './Icon';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const CLOSE_MS = 380;

/**
 * Native <dialog>: focus trapping, Escape and the top layer for free.
 * Opens and closes with a soft scale and fade.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      delete dialog.dataset.closing;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      return;
    }
    if (!open && dialog.open) {
      dialog.dataset.closing = 'true';
      const timer = window.setTimeout(() => {
        dialog.close();
        delete dialog.dataset.closing;
      }, CLOSE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${styles.panel} glass`}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t.common.close}
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
