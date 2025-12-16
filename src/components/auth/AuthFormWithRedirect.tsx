"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "./AuthForm";

type AuthMode = "login" | "signup";

function isSafeRedirectPath(path: string | null): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

function Inner({ mode }: { mode: AuthMode }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("redirect");
  const redirectTo = isSafeRedirectPath(raw) ? raw : "/";
  return <AuthForm mode={mode} redirectTo={redirectTo} />;
}

export function AuthFormWithRedirect({ mode }: { mode: AuthMode }) {
  return (
    <Suspense fallback={<AuthForm mode={mode} redirectTo="/" />}>
      <Inner mode={mode} />
    </Suspense>
  );
}


