"use client";

import React, { useEffect, useRef, useState } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/utils/auth-cookies";
import { setUserAuthToken } from "@/lib/utils/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { toSerializableAuthUser } from "@/lib/schemas/auth";
import { logError } from "@/lib/utils/logger";

function clearSignedOutSession(): void {
  clearAuthCookie();
  useAuthStore.getState().setUser(null);
  useAuthStore.getState().setLoading(false);
  useRecipeStore.getState().resetUserInput();
  useUserProfileStore.getState().clearUserProfile();
}

async function syncAuthToken(
  user: User,
  currentVersion: number,
  versionRef: React.MutableRefObject<number>,
  controller: AbortController
): Promise<void> {
  const uid = user.uid;

  try {
    await setUserAuthToken(user);
    if (currentVersion !== versionRef.current) return;
    if (controller.signal.aborted) return;
  } catch (error) {
    if (currentVersion !== versionRef.current) return;
    if (controller.signal.aborted) return;
    logError("Failed to set auth token", error, { uid });
  } finally {
    if (currentVersion === versionRef.current && !controller.signal.aborted) {
      useAuthStore.getState().setLoading(false);
    }
  }
}

function handleAuthUserChanged(
  user: User | null,
  currentVersion: number,
  versionRef: React.MutableRefObject<number>,
  controller: AbortController
): Promise<void> {
  if (!user) {
    clearSignedOutSession();
    return Promise.resolve();
  }

  useAuthStore.getState().setUser(toSerializableAuthUser(user));
  return syncAuthToken(user, currentVersion, versionRef, controller);
}

/**
 * Authentication listener component.
 * Monitors Firebase auth state changes and syncs auth cookies.
 */
export function AuthListener(): React.ReactElement | null {
  const controllerRef = useRef<AbortController | null>(null);
  const versionRef = useRef(0);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onIdTokenChanged(auth, (user) => {
        const currentVersion = ++versionRef.current;
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        void handleAuthUserChanged(
          user,
          currentVersion,
          versionRef,
          controller
        );
      });
    } catch (error) {
      logError("Firebase authentication initialization failed", error);
      useAuthStore.getState().setLoading(false);
      setInitError(
        "Authentication system unavailable. Please refresh the page."
      );
    }

    return () => {
      controllerRef.current?.abort();
      unsubscribe();
    };
  }, []);

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
