"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GradientBackground from "@/components/layout/GradientBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Orders", href: "/admin/orders", icon: "shopping_cart" },
  { label: "Products", href: "/admin/products", icon: "inventory_2" },
  { label: "Export", href: "/admin/export", icon: "ios_share" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyAdminSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (!user) {
          router.replace("/admin");
          return;
        }

        setIsAuthorized(true);
      } catch (sessionError) {
        setAuthError(
          sessionError instanceof Error ? sessionError.message : "Failed to verify session."
        );
      }
    }

    verifyAdminSession();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }

    router.replace("/admin");
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <GradientBackground />
        <div className="relative z-10 bg-surface p-8 rounded-xl border border-outline-variant/40">
          <p className="font-body text-[16px] leading-[1.6] text-error">{authError}</p>
          <Link
            href="/admin"
            className="inline-flex mt-4 px-5 py-2 rounded-lg border border-outline-variant"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <GradientBackground />
        <p className="relative z-10 font-body text-[16px] leading-[1.6] text-on-surface-variant">
          Verifying admin session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background font-body text-[16px] leading-[1.6]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 flex-shrink-0 border-r border-outline-variant bg-surface-container-low sticky top-0">
        <div className="flex flex-col h-full p-4 gap-[var(--spacing-stack-sm)]">
          {/* Admin Header */}
          <div className="mb-[var(--spacing-stack-md)] flex items-center gap-3 px-4 mt-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
              SA
            </div>
            <div>
              <h2 className="font-display text-[24px] leading-[1.4] text-primary">
                Saaral Admin
              </h2>
              <p className="font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium text-on-surface-variant">
                Management Portal
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium ${
                    isActive
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={
                      isActive
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-auto mx-1 mb-2 flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all font-body text-[12px] leading-[1.0] tracking-[0.1em] font-medium"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <GradientBackground />
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center px-[var(--spacing-margin-mobile)] py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
          <h1 className="font-display text-[32px] leading-[1.3] text-primary tracking-tight">
            Saaral Admin
          </h1>
          <button className="p-2 text-on-surface-variant">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
