"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/utils/auth-cookies";
import { setUserAuthToken } from "@/lib/utils/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { logError } from "@/lib/utils/logger";

/**
 * Authentication listener component.
 * Monitors Firebase auth state changes and syncs auth cookies.
 * Must be mounted in the root layout to track auth across the entire app.
 */
export function AuthListener(): null {
  const { setUser, setLoading } = useAuthStore();
  const { clearPersistedState } = useRecipeStore();
  const controllerRef = useRef<AbortController | null>(null);
  const versionRef = useRef(0);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // Increment version to invalidate previous operations
      const currentVersion = ++versionRef.current;
      
      // Cancel any pending token operations from previous auth events
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setUser(user);

      if (!user) {
        clearAuthCookie();
        clearPersistedState();
        setLoading(false);
        return;
      }

      const uid = user.uid;

      try {
        await setUserAuthToken(user);
        
        // Check if this operation is stale (newer auth event occurred)
        if (currentVersion !== versionRef.current) return;
        if (controller.signal.aborted) return;
      } catch (error) {
        // Ignore abort errors and stale operations - they're expected when auth state changes
        if (currentVersion !== versionRef.current) return;
        if (controller.signal.aborted) return;
        
        logError("Failed to set auth token", error, { uid });
      } finally {
        // Only update loading state if this is still the current operation
        if (currentVersion === versionRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    });

    return () => {
      controllerRef.current?.abort();
      unsubscribe();
    };
  }, [setUser, setLoading, clearPersistedState]);

  return null;
}
