"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "./AuthForm";
import { getSafeRedirectPath } from "@/lib/utils/navigation";

type AuthMode = "login" | "signup";

function Inner({ mode }: { mode: AuthMode }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("redirect");
  const redirectTo = getSafeRedirectPath(raw);
  return <AuthForm mode={mode} redirectTo={redirectTo} />;
}

/**
 * Auth form wrapper with redirect handling from URL search params.
 * Uses Suspense boundary for safe useSearchParams access.
 */
export function AuthFormWithRedirect({ mode }: { mode: AuthMode }) {
  return (
    <Suspense fallback={<AuthForm mode={mode} redirectTo="/" />}>
      <Inner mode={mode} />
    </Suspense>
  );
}


