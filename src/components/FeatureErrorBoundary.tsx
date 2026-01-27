"use client";

import { ErrorBoundary } from "./ErrorBoundary";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
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
 * 
 * Note: This is a convenience wrapper around ErrorBoundary with variant="feature"
 */
export function FeatureErrorBoundary({ children, featureName, fallback }: Props) {
  return (
    <ErrorBoundary variant="feature" featureName={featureName} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
