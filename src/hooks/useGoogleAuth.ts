"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";

/**
 * Hook for handling Google authentication.
 * Provides consistent Google sign-in functionality across login/signup pages.
 */
export function useGoogleAuth(redirectTo: string = "/") {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithPopup(auth, googleProvider);
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

