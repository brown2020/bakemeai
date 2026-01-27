"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { setAuthCookieToken } from "@/lib/auth-cookie";

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  setError: (error: string | null) => void;
}

/**
 * Hook for handling Google authentication.
 * Provides consistent Google sign-in functionality across login/signup pages.
 */
export function useGoogleAuth(redirectTo: string = "/"): UseGoogleAuthReturn {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      setAuthCookieToken(token);
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during Google sign-in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    error,
    isLoading,
    setError,
  };
}
