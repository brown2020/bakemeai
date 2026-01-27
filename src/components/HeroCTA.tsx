"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Client component for auth-aware hero CTA buttons.
 * Keeps the home page mostly server-rendered while handling auth state.
 */
export function HeroCTA(): ReactElement {
  const { user, loading } = useAuthStore();

  // Show placeholder during hydration to prevent layout shift
  if (loading) {
    return (
      <div className="mt-5 sm:mt-8 sm:flex sm:gap-4">
        <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-5 sm:mt-8 sm:flex sm:gap-4">
        <Link href="/generate" prefetch={false}>
          <Button size="lg" className="w-full">
            Start Cooking
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 sm:mt-8 sm:flex sm:gap-4">
      <Link href="/login">
        <Button size="lg" className="w-full">
          Sign In
        </Button>
      </Link>
      <Link href="/signup">
        <Button variant="secondary" size="lg" className="w-full mt-3 sm:mt-0">
          Create Account
        </Button>
      </Link>
    </div>
  );
}


