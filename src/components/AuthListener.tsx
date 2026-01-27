"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthCookie, setAuthCookieToken } from "@/lib/auth-cookie";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthListener(): null {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let authEventId = 0;

    // Track token lifecycle (sign-in, refresh, sign-out) so `firebaseAuth` doesn't go stale.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const currentEventId = ++authEventId;

      setUser(user);

      if (!user) {
        clearAuthCookie();
        setLoading(false);
        return;
      }

      const uid = user.uid;
      const token = await user.getIdToken();

      // If a newer auth event happened (e.g. sign-out) or the user changed, do nothing.
      if (currentEventId !== authEventId) return;
      if (auth.currentUser?.uid !== uid) return;

      setAuthCookieToken(token);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return null;
}

