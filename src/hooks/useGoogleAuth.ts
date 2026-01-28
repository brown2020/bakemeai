"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { setUserAuthToken } from "@/lib/utils/auth";
import { convertErrorToMessage, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import { logError } from "@/lib/utils/logger";

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
      await setUserAuthToken(userCredential.user);
      router.push(redirectTo);
    } catch (err) {
      logError("Google sign-in failed", err, { redirectTo });
      const errorMessage = convertErrorToMessage(err, ERROR_MESSAGES.AUTH.SIGN_IN_FAILED);
      setError(errorMessage);
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
