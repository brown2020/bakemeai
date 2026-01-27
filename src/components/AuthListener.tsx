"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    let currentController: AbortController | null = null;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // Cancel any pending token operations from previous auth events
      currentController?.abort();
      const controller = new AbortController();
      currentController = controller;

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
      currentController?.abort();
      unsubscribe();
    };
  }, [setUser, setLoading]);

  return null;
}
