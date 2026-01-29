"use client";

import React, { useEffect, useRef, useState } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/utils/auth-cookies";
import { setUserAuthToken } from "@/lib/utils/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { logError } from "@/lib/utils/logger";

/**
 * Syncs user auth token to cookie with race condition protection.
 *
 * RACE CONDITION HANDLING:
 * Uses version tracking + abort controller to handle rapid auth state changes:
 * - versionRef: Incremented on each auth event, invalidates stale operations
 * - AbortController: Cancels pending async operations from previous events
 * - Double-check before state updates: Ensures only the latest event updates state
 *
 * Why needed: If user signs out then back in quickly, we don't want the signout
 * token operation to complete after the new signin, wiping the fresh token.
 */
async function syncAuthToken(
  user: User,
  currentVersion: number,
  versionRef: React.MutableRefObject<number>,
  controller: AbortController,
  setLoading: (loading: boolean) => void
): Promise<void> {
  const uid = user.uid;

  try {
    await setUserAuthToken(user);

    // Guard: Check if this operation is stale (newer auth event occurred)
    if (currentVersion !== versionRef.current) return;
    if (controller.signal.aborted) return;
  } catch (error) {
    // Guard: Ignore abort errors and stale operations
    if (currentVersion !== versionRef.current) return;
    if (controller.signal.aborted) return;

    logError("Failed to set auth token", error, { uid });
  } finally {
    // Only update loading state if this is still the current operation
    if (currentVersion === versionRef.current && !controller.signal.aborted) {
      setLoading(false);
    }
  }
}

/**
 * Authentication listener component.
 * Monitors Firebase auth state changes and syncs auth cookies.
 * Must be mounted in the root layout to track auth across the entire app.
 */
export function AuthListener(): React.ReactElement | null {
  const { setUser, setLoading } = useAuthStore();
  const { clearPersistedState } = useRecipeStore();
  const controllerRef = useRef<AbortController | null>(null);
  const versionRef = useRef(0);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    /*
     * Initialize unsubscribe as no-op function to ensure cleanup always works.
     *
     * Why: If onIdTokenChanged throws during initialization, cleanup would fail
     * without this because unsubscribe would be undefined.
     */
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onIdTokenChanged(auth, async (user) => {
        /*
         * Increment version to invalidate previous operations.
         *
         * Failure scenario prevented:
         * 1. User signs in → version becomes 1, starts token fetch
         * 2. User immediately signs out → version becomes 2
         * 3. Old token fetch (version 1) completes
         * 4. Without version check: stale token would be set, user stays "logged in"
         * 5. With version check: stale operation detects version mismatch and aborts
         */
        const currentVersion = ++versionRef.current;

        /*
         * Cancel any pending token operations from previous auth events.
         *
         * Why AbortController: Provides a standard way to cancel async operations
         * like fetch() calls. When aborted, any in-flight getIdToken() requests
         * will be cancelled, preventing unnecessary work.
         */
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setUser(user);

        if (!user) {
          // User signed out: clear all auth state immediately
          clearAuthCookie();
          clearPersistedState();
          setLoading(false);
          return;
        }

        /*
         * User signed in: fetch and store auth token.
         *
         * This is async, so we pass version and controller to detect if this
         * operation becomes stale before it completes (see syncAuthToken guards).
         */
        await syncAuthToken(
          user,
          currentVersion,
          versionRef,
          controller,
          setLoading
        );
      });
    } catch (error) {
      /*
       * Initialization failure handling.
       *
       * This catch block handles Firebase SDK initialization errors, not runtime
       * auth state changes. If we reach here, the entire auth system is broken
       * (e.g., invalid Firebase config, network unreachable).
       */
      logError("Firebase authentication initialization failed", error);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialization error handling
      setInitError(
        "Authentication system unavailable. Please refresh the page."
      );
      setLoading(false);
    }

    return () => {
      // Cleanup: cancel in-flight operations and unsubscribe from auth changes
      controllerRef.current?.abort();
      unsubscribe();
    };
  }, [setUser, setLoading, clearPersistedState]);

  if (initError) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 mx-auto max-w-2xl px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
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
                Authentication Error
              </h3>
              <div className="mt-1 text-sm text-red-700">{initError}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
