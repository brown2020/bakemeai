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
    let authEventId = 0;
    let isMounted = true;

    // Track token lifecycle (sign-in, refresh, sign-out) so `firebaseAuth` doesn't go stale.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const currentEventId = ++authEventId;

      // Early return if component unmounted during async operation
      if (!isMounted) return;

      setUser(user);

      if (!user) {
        clearAuthCookie();
        setLoading(false);
        return;
      }

      const uid = user.uid;

      // If a newer auth event happened (e.g. sign-out) or the user changed, do nothing.
      if (currentEventId !== authEventId) return;
      if (auth.currentUser?.uid !== uid) return;
      if (!isMounted) return;

      try {
        await setUserAuthToken(user);
        
        // Recheck after async operation - user might have signed out during token refresh
        if (currentEventId !== authEventId || !isMounted) return;
      } catch (error) {
        // Log token refresh errors but don't crash the auth listener
        logError("Failed to set auth token", error, { uid });
        // Continue anyway - user is still authenticated in Firebase
      } finally {
        if (isMounted && currentEventId === authEventId) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser, setLoading]);

  return null;
}
