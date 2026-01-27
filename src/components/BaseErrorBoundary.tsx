import { Component, ReactNode } from "react";

/**
 * Base props for error boundaries.
 */
export interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

/**
 * Base state for error boundaries.
 */
export interface BaseErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Base error boundary component with shared logic.
 * Provides common error boundary functionality:
 * - Error catching and state management
 * - Auto-reset on children change
 * - Manual reset support
 * 
 * Subclasses must implement:
 * - logError method for custom logging
 * - renderFallback method for custom error UI
 */
export abstract class BaseErrorBoundary<
  P extends BaseErrorBoundaryProps = BaseErrorBoundaryProps
> extends Component<P, BaseErrorBoundaryState> {
  constructor(props: P) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BaseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: P): void {
    // Auto-reset when children change (e.g., navigation)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  /**
   * Override to provide custom error logging.
   */
  protected abstract logError(error: Error, errorInfo: React.ErrorInfo): void;

  /**
   * Override to provide custom error UI.
   */
  protected abstract renderFallback(): ReactNode;

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return this.renderFallback();
    }

    return this.props.children;
  }
}
