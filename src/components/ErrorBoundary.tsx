"use client";

import { Component, ReactNode } from "react";
import { logError } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: "global" | "feature";
  featureName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches React errors and displays a fallback UI.
 * Prevents the entire app from crashing due to component errors.
 * 
 * Variants:
 * - global: Full-page error UI for app-level boundaries (default)
 * - feature: Inline error UI for feature-level boundaries (requires featureName)
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const logMessage = this.props.featureName
      ? `Error in ${this.props.featureName}`
      : "Error boundary caught an error";
    
    logError(logMessage, error, {
      ...(this.props.featureName && { featureName: this.props.featureName }),
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.variant === "feature") {
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

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
