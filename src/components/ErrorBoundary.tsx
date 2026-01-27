"use client";

import { ReactNode } from "react";
import { logError as logErrorUtil } from "@/lib/utils/logger";
import { ReloadButton } from "./ReloadButton";
import { BaseErrorBoundary, BaseErrorBoundaryProps } from "./BaseErrorBoundary";

/**
 * Global error boundary component for app-level error handling.
 * Catches React errors and displays a full-page fallback UI.
 * Prevents the entire app from crashing due to uncaught component errors.
 * 
 * Automatically resets when children change (e.g., navigation).
 * 
 * Usage: Wrap the root app component in layout.tsx
 */
export class ErrorBoundary extends BaseErrorBoundary<BaseErrorBoundaryProps> {
  protected logError(error: Error, errorInfo: React.ErrorInfo): void {
    logErrorUtil("Global error boundary caught an error", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  protected renderFallback(): ReactNode {
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
}
