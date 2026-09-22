import type { Metadata } from "next";

import { ProfilePageClient } from "./ProfilePageClient";
import { PROFILE_WELCOME_QUERY } from "@/lib/constants/onboarding";
import { isProfileWelcomeSearchParam } from "@/lib/utils/onboarding";

export const metadata: Metadata = {
  title: "Cooking preferences",
  description: "Manage dietary preferences for Bake.me",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params[PROFILE_WELCOME_QUERY];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const isWelcomeFlow = isProfileWelcomeSearchParam(value ?? null);

  return <ProfilePageClient isWelcomeFlow={isWelcomeFlow} />;
}
