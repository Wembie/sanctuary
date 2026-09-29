import { Component, type ReactNode } from 'react';
import { useT } from '../i18n';
import styles from './App.module.css';

interface State {
  failed: boolean;
}

/**
 * If a page ever breaks, nobody sees a stack trace. The sky keeps moving
 * and a quiet way back is offered.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) console.error(error);
  }

  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

/** Function component so the fallback can use the current language. */
function Fallback() {
  const t = useT();
  return (
    <div className={styles.fallback}>
      <p>{t.error.message}</p>
      <a href="#/" className={styles.fallbackLink}>
        {t.error.home}
      </a>
    </div>
  );
}
