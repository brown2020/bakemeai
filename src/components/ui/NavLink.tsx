"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Navigation link component with active state styling.
 * Shows text on desktop and icon on mobile.
 */
export function NavLink({
  href,
  children,
  icon,
  className = "",
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
      } ${className}`}
    >
      {icon && <span className="sm:hidden">{icon}</span>}
      <span className={icon ? "hidden sm:inline" : ""}>{children}</span>
    </Link>
  );
}
