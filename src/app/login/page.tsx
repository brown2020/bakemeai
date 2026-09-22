import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { getSafeRedirectPath } from "@/lib/utils/navigation";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Bake.me",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(params.redirect, "/generate");
  return <AuthForm mode="login" redirectTo={redirectTo} />;
}
