"use client";

import React, { Component, ReactNode } from "react";
import { logError as logErrorUtil } from "@/lib/utils/logger";
import { ReloadButton } from "./ReloadButton";

/**
 * Error boundary variant types.
 */
type ErrorBoundaryVariant = "global" | "feature";

interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: ErrorBoundaryVariant;
  featureName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Unified error boundary component for app-level and feature-level error handling.
 * 
 * USAGE:
 * 
 * Global (full-page error):
 * <ErrorBoundary variant="global">
 *   <App />
 * </ErrorBoundary>
 * 
 * Feature (inline error):
 * <ErrorBoundary variant="feature" featureName="Recipe Generation">
 *   <RecipeForm />
 * </ErrorBoundary>
 * 
 * FEATURES:
 * - Catches React errors and displays fallback UI
 * - Auto-resets when children change (navigation)
 * - Variant-specific logging and UI
 * - Custom fallback support via render prop
 * 
 * NOTE: Error boundaries must be class components (no hook equivalent yet).
 * This is one of the rare cases where classes are still required in React.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { variant = "global", featureName } = this.props;
    
    // Log with variant-specific context
    if (variant === "feature" && featureName) {
      logErrorUtil(`Error in ${featureName}`, error, {
        variant,
        featureName,
        componentStack: errorInfo.componentStack,
      });
    } else {
      logErrorUtil("Global error boundary caught an error", error, {
        variant,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Auto-reset when children change (e.g., navigation)
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  renderGlobalFallback(): ReactNode {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <ReloadButton variant="global" />
        </div>
      </div>
    );
  }

  renderFeatureFallback(): ReactNode {
    const { featureName = "This feature" } = this.props;
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex">
          <div className="shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {featureName} Error
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Something went wrong with {featureName}. Please
                try refreshing the page.
              </p>
            </div>
            <div className="mt-4">
              <ReloadButton variant="feature" label="Refresh Page" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback takes precedence
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Variant-specific fallbacks
      const { variant = "global" } = this.props;
      return variant === "feature" 
        ? this.renderFeatureFallback() 
        : this.renderGlobalFallback();
    }

    return this.props.children;
  }
}
