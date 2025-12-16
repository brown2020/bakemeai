"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Input, ErrorMessage } from "@/components/ui";
import { Button } from "@/components/Button";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

/**
 * Shared authentication form for login and signup pages.
 * Reduces code duplication while maintaining flexibility.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get("redirect");
  const redirectTo =
    typeof rawRedirect === "string" &&
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  const { signInWithGoogle, error: googleError } = useGoogleAuth(redirectTo);

  const isLogin = mode === "login";
  const title = isLogin ? "Sign in to Bake.me" : "Create your Bake.me account";
  const submitLabel = isLogin ? "Sign in" : "Sign up";
  const googleLabel = isLogin ? "Sign in with Google" : "Sign up with Google";
  const altLinkText = isLogin
    ? "Don't have an account? Sign up"
    : "Already have an account? Sign in";
  const altLinkHref = isLogin ? "/signup" : "/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      }
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || googleError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-center">{title}</h2>
        </div>

        {displayError && <ErrorMessage message={displayError} />}

        {verificationSent && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            Verification email sent! Please check your inbox.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded-sm"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  href="/reset-password"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            {submitLabel}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton onClick={signInWithGoogle} label={googleLabel} />

        <div className="text-center">
          <Link
            href={altLinkHref}
            className="text-blue-500 hover:text-blue-600"
          >
            {altLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
}


