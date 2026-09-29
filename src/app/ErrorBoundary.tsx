import { Component, type ReactNode } from 'react';
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
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.fallback}>
        <p>This corner of the sanctuary is resting.</p>
        <a href="#/" className={styles.fallbackLink}>
          Return home
        </a>
      </div>
    );
  }
}
