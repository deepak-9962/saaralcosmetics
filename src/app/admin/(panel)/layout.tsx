"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import GradientBackground from "@/components/layout/GradientBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { subscribeToOrders } from "@/lib/supabase/data";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Orders", href: "/admin/orders", icon: "shopping_cart" },
  { label: "Products", href: "/admin/products", icon: "inventory_2" },
  { label: "Customers", href: "/admin/customers", icon: "group" },
  { label: "Export", href: "/admin/export", icon: "ios_share" },
];

function SidebarContent({
  pathname,
  newOrderCount,
  onSignOut,
  onClose,
}: {
  pathname: string;
  newOrderCount: number;
  onSignOut: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full p-4 gap-[var(--spacing-stack-sm)]">
      {/* Branding */}
      <div className="mb-[var(--spacing-stack-md)] px-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
            S
          </div>
          <div>
            <h2 className="font-display text-[22px] leading-[1.3] text-primary">Saaral</h2>
            <p className="font-body text-[10px] leading-[1.0] tracking-[0.18em] font-medium text-on-surface-variant uppercase">
              Admin Portal
            </p>
          </div>
        </div>
        {/* Live indicator */}
        <div className="mt-3 flex items-center gap-2 px-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-body text-[10px] leading-[1.0] tracking-[0.1em] text-emerald-700 font-medium uppercase">
            Live Sync Active
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const showBadge = item.href === "/admin/orders" && newOrderCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body text-[13px] leading-[1.0] tracking-[0.08em] font-medium ${
                isActive
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
              {showBadge && (
                <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-on-primary text-[10px] leading-[1.0] font-bold animate-pulse">
                  {newOrderCount > 9 ? "9+" : newOrderCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-outline-variant/40 pt-3 mt-2">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all font-body text-[13px] leading-[1.0] tracking-[0.08em] font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const newOrderCountRef = useRef(0);

  useEffect(() => {
    async function verifyAdminSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) { setAuthError(error.message); return; }
        if (!user) { router.replace("/admin"); return; }
        setIsAuthorized(true);
      } catch (sessionError) {
        setAuthError(sessionError instanceof Error ? sessionError.message : "Failed to verify session.");
      }
    }
    verifyAdminSession();
  }, [router]);

  // Realtime: listen for new orders and bump badge count
  useEffect(() => {
    if (!isAuthorized) return;
    const unsubscribe = subscribeToOrders(() => {
      newOrderCountRef.current += 1;
      setNewOrderCount(newOrderCountRef.current);
    });
    return unsubscribe;
  }, [isAuthorized]);

  // Reset badge when visiting orders page
  useEffect(() => {
    if (pathname.startsWith("/admin/orders")) {
      newOrderCountRef.current = 0;
      setNewOrderCount(0);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin");
  };

  if (authError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6">
        <GradientBackground />
        <div className="relative z-10 bg-surface p-8 rounded-xl border border-outline-variant/40">
          <p className="font-body text-[16px] leading-[1.6] text-error">{authError}</p>
          <Link href="/admin" className="inline-flex mt-4 px-5 py-2 rounded-lg border border-outline-variant">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6">
        <GradientBackground />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
          <p className="font-body text-[14px] leading-[1.6] text-on-surface-variant">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex bg-background text-on-background font-body text-[16px] leading-[1.6]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-[100dvh] w-64 flex-shrink-0 border-r border-outline-variant/40 bg-surface-container-low sticky top-0">
        <SidebarContent
          pathname={pathname}
          newOrderCount={newOrderCount}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant/40 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              pathname={pathname}
              newOrderCount={newOrderCount}
              onSignOut={handleSignOut}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <GradientBackground />
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center px-[var(--spacing-margin-mobile)] py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <h1 className="font-display text-[24px] leading-[1.3] text-primary">Saaral Admin</h1>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors relative"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
            {newOrderCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        </header>
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
