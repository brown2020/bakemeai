"use client";

import { Component, ReactNode } from "react";
import { logError } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Granular error boundary for isolating feature-level failures.
 * Prevents a single feature's error from crashing the entire app.
 * 
 * Usage:
 * <FeatureErrorBoundary featureName="Recipe Generation">
 *   <RecipeForm />
 * </FeatureErrorBoundary>
 * 
 * Benefits:
 * - Isolates errors to specific features
 * - Provides contextual error messages
 * - Logs errors with feature context for debugging
 * - Allows rest of app to continue functioning
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(`Error in ${this.props.featureName}`, error, {
      featureName: this.props.featureName,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
                {this.props.featureName} Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Something went wrong with {this.props.featureName}. Please
                  try refreshing the page.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
