"use client";

import { useEffect } from "react";

/**
 * Global error boundary for the application.
 * This component catches errors at the root level.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Something went wrong!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;re sorry, but an unexpected error has occurred.
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
