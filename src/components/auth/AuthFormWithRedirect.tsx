"use client";

import type { ReactElement } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "./AuthForm";
import { getSafeRedirectPath } from "@/lib/utils/navigation";

type AuthMode = "login" | "signup";

function Inner({ mode }: { mode: AuthMode }): ReactElement {
  const searchParams = useSearchParams();
  const raw = searchParams.get("redirect");
  const redirectTo = getSafeRedirectPath(raw);
  return <AuthForm mode={mode} redirectTo={redirectTo} />;
}

export function AuthFormWithRedirect({ mode }: { mode: AuthMode }): ReactElement {
  return (
    <Suspense fallback={<AuthForm mode={mode} redirectTo="/" />}>
      <Inner mode={mode} />
    </Suspense>
  );
}


