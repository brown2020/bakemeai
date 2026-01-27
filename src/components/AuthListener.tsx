"use client";

import { useEffect, useRef } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/utils/auth-cookies";
import { setUserAuthToken } from "@/lib/utils/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { logError } from "@/lib/utils/logger";

/**
 * Authentication listener component.
 * Monitors Firebase auth state changes and syncs auth cookies.
 * Must be mounted in the root layout to track auth across the entire app.
 */
export function AuthListener(): null {
  const { setUser, setLoading } = useAuthStore();
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // Cancel any pending token operations from previous auth events
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setUser(user);

      if (!user) {
        clearAuthCookie();
        setLoading(false);
        return;
      }

      const uid = user.uid;

      try {
        await setUserAuthToken(user);
        
        // Check if this operation was cancelled (newer auth event or unmount)
        if (controller.signal.aborted) return;
      } catch (error) {
        // Ignore abort errors - they're expected when auth state changes
        if (controller.signal.aborted) return;
        
        logError("Failed to set auth token", error, { uid });
      } finally {
        // Only update loading state if this is still the current operation
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    });

    return () => {
      controllerRef.current?.abort();
      unsubscribe();
    };
  }, [setUser, setLoading]);

  return null;
}
