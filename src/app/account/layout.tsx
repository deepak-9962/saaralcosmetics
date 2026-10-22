"use client";

/**
 * Layout for /account/* routes.
 *
 * Public routes:
 *   /account/login, /account/register, /account/forgot-password, /account/reset-password
 *   - Accessible without authentication.
 *   - Automatically redirects to /account/dashboard if already logged in.
 *
 * Protected routes:
 *   /account/dashboard, /account/profile, /account/orders, etc.
 *   - Shows a loading spinner while validating session.
 *   - Redirects to /account/login if unauthenticated.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const PUBLIC_ACCOUNT_ROUTES = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ACCOUNT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (isLoading) return;

    // Unauthenticated user trying to access a protected account page
    if (!user && !isPublic) {
      router.replace(`/account/login?next=${encodeURIComponent(pathname)}`);
    }

    // Authenticated user visiting login/register pages
    if (user && isPublic) {
      router.replace("/account/dashboard");
    }
  }, [user, isLoading, isPublic, pathname, router]);

  // Public pages render immediately without blocking
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected pages: show smooth spinner while session hydrates
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="font-body text-[13px] text-on-surface-variant">Loading…</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on a public page, wait for redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
