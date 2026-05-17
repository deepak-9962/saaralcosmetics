"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const navItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Shop", href: "/products", icon: "storefront" },
  { label: "Cart", href: "/cart", icon: "shopping_bag" },
  { label: "Account", href: "/contact", icon: "person" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/products") {
    return pathname === "/products" || pathname.startsWith("/products/");
  }

  return pathname === href;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout") || pathname.startsWith("/order-confirmation")) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-lg"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="relative max-w-[var(--spacing-container-max)] mx-auto px-2 pt-2">
        <div className="grid grid-cols-5 items-end">
          <Link
            href="/products"
            className="col-start-3 row-start-1 justify-self-center -translate-y-5 bg-primary text-on-primary rounded-full h-14 w-14 shadow-[0_12px_30px_-12px_rgba(176,96,128,0.75)] border-2 border-surface-container-lowest flex items-center justify-center"
            aria-label="Unlock offer"
          >
            <div className="text-center leading-none">
              <span className="block text-[9px] tracking-[0.1em] font-semibold">SAVE</span>
              <span className="block text-[11px] font-bold">₹100</span>
            </div>
          </Link>

          {navItems.slice(0, 2).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 ${active ? "text-primary" : "text-on-surface-variant"}`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="font-body text-[11px] leading-none">{item.label}</span>
              </Link>
            );
          })}

          {navItems.slice(2).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 py-2 ${active ? "text-primary" : "text-on-surface-variant"}`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="font-body text-[11px] leading-none">{item.label}</span>
                {item.href === "/cart" && itemCount > 0 && (
                  <span className="absolute top-0 right-[22px] min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[9px] font-semibold flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
