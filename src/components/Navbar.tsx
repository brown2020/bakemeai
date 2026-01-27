"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { auth } from "@/lib/firebase";
import { clearAuthCookie } from "@/lib/auth-cookie";
import Image from "next/image";
import { Wand2, BookMarked, Settings } from "lucide-react";
import { NavLink } from "@/components/ui";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  const handleSignOut = async () => {
    // Clear client state/cookies immediately to ensure proxy.ts sees a signed-out request.
    clearAuthCookie();
    setIsProfileOpen(false);

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

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b truncate">
                        {user.email}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
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
