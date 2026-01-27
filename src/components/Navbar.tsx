"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/utils/auth-cookies";
import Image from "next/image";
import { Wand2, BookMarked, Settings } from "lucide-react";
import { NavLink } from "@/components/ui";
import { UserMenu } from "@/components/UserMenu";

/**
 * Main navigation bar component.
 * Shows authenticated navigation with user menu or login/signup buttons.
 * Fixed positioning with responsive design.
 */
export function Navbar() {
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    // Clear client state/cookies immediately to ensure proxy.ts sees a signed-out request.
    clearAuthCookie();

    try {
      await auth.signOut();
    } finally {
      // Force a full navigation to drop any prefetched/cached protected route payloads.
      window.location.assign("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-xs z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="BakeMe.ai Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-blue-600">Bake.me</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <NavLink href="/generate" icon={<Wand2 className="w-5 h-5" />}>
                  Generate Recipe
                </NavLink>
                <NavLink
                  href="/saved"
                  icon={<BookMarked className="w-5 h-5" />}
                >
                  Saved Recipes
                </NavLink>
                <NavLink
                  href="/profile"
                  icon={<Settings className="w-5 h-5" />}
                >
                  Preferences
                </NavLink>

                <UserMenu user={user} onSignOut={handleSignOut} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-blue-600 px-2 sm:px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-500 text-white hover:bg-blue-600 px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
