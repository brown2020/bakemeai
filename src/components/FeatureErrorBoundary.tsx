"use client";

import { ReactNode } from "react";
import { logError as logErrorUtil } from "@/lib/utils/logger";
import { ReloadButton } from "./ReloadButton";
import { BaseErrorBoundary, BaseErrorBoundaryProps } from "./BaseErrorBoundary";

interface Props extends BaseErrorBoundaryProps {
  featureName: string;
}

/**
 * Feature-level error boundary for isolating failures in specific features.
 * Prevents a single feature's error from crashing the entire app.
 * Displays an inline error UI with contextual information.
 * 
 * Automatically resets when children change (e.g., user navigates away and back).
 * 
 * Usage:
 * <FeatureErrorBoundary featureName="Recipe Generation">
 *   <RecipeForm />
 * </FeatureErrorBoundary>
 * 
 * Benefits:
 * - Isolates errors to specific features
 * - Provides contextual error messages with feature name
 * - Logs errors with feature context for debugging
 * - Allows rest of app to continue functioning
 * - Auto-recovers when content changes
 */
export class FeatureErrorBoundary extends BaseErrorBoundary<Props> {
  protected logError(error: Error, errorInfo: React.ErrorInfo): void {
    logErrorUtil(`Error in ${this.props.featureName}`, error, {
      featureName: this.props.featureName,
      componentStack: errorInfo.componentStack,
    });
  }

  protected renderFallback(): ReactNode {
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
              <ReloadButton variant="feature" label="Refresh Page" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
