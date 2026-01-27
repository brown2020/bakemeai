/**
 * Root layout - Server Component (Next.js 16 default)
 * 
 * This layout is intentionally a server component to:
 * - Enable metadata export (only available in server components)
 * - Minimize client-side JavaScript bundle size
 * - Leverage server-side rendering for better performance
 * 
 * Client-only features (ErrorBoundary, AuthListener, Navbar) are
 * correctly isolated in their own "use client" components.
 */

import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthListener } from "@/components/AuthListener";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bake.me",
  description: "AI-powered recipe generation platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthListener />
          <Navbar />
          <main className="pt-16">{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
