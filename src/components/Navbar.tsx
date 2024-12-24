"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { Wand2, BookMarked } from "lucide-react";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
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

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/generate"
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/generate")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="hidden sm:inline">Generate Recipe</span>
                  <Wand2 className="w-5 h-5 sm:hidden" />
                </Link>
                <Link
                  href="/saved"
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    isActive("/saved")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="hidden sm:inline">Saved Recipes</span>
                  <BookMarked className="w-5 h-5 sm:hidden" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.email}
                      </div>
                      <Link
                        href="/profile"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => auth.signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 text-sm font-medium rounded-md"
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
