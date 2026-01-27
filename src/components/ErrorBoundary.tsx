"use client";

import { Component, ReactNode } from "react";
import { logError } from "@/lib/utils/logger";
import { ReloadButton } from "./ReloadButton";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global error boundary component for app-level error handling.
 * Catches React errors and displays a full-page fallback UI.
 * Prevents the entire app from crashing due to uncaught component errors.
 * 
 * Usage: Wrap the root app component in layout.tsx
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
    logError("Global error boundary caught an error", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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

    return this.props.children;
  }
}
