import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { getSafeRedirectPath } from "@/lib/utils/navigation";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Bake.me account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(params.redirect, "/generate");
  return <AuthForm mode="signup" redirectTo={redirectTo} />;
}
