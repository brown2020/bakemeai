"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Hero call-to-action component with auth-aware buttons.
 * Shows different CTAs for authenticated vs anonymous users.
 * Handles loading state to prevent layout shift during hydration.
 */
export function HeroCTA() {
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


