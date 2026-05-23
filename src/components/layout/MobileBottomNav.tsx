"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const navItemsLeft = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Shop", href: "/products", icon: "storefront" },
];

const navItemsRight = [
  { label: "Wishlist", href: "/wishlist", icon: "favorite" },
  { label: "Cart", href: "/cart", icon: "shopping_bag" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/products") return pathname === "/products" || pathname.startsWith("/products/");
  return pathname === href;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-confirmation")
  ) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      style={{
        background: "rgba(253,246,240,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(201,167,77,0.14)",
        boxShadow: "0 -4px 24px rgba(42,26,20,0.06)",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="relative max-w-[var(--spacing-container-max)] mx-auto px-2 pt-1">
        <div className="grid grid-cols-5 items-end">
          
          {/* Left items (Home, Shop) */}
          {navItemsLeft.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-2 transition-all duration-200 active:scale-90"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute top-0.5 w-1 h-1 rounded-full"
                    style={{ background: "#8B3A5E" }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "20px",
                    color: active ? "#8B3A5E" : "rgba(90,58,44,0.38)",
                    fontVariationSettings: `'FILL' ${active ? 1 : 0}`,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="font-body text-[10px] leading-none"
                  style={{
                    color: active ? "#8B3A5E" : "rgba(90,58,44,0.38)",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.04em",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Elevated central raised button with leaf icon */}
          <div className="flex justify-center row-start-1 col-start-3">
            <Link
              href="/products"
              className="-translate-y-4 bg-gradient-to-br from-[#B06080] to-[#8B3A5E] text-white rounded-full h-13 w-13 shadow-[0_8px_20px_rgba(139,58,94,0.38)] border-[3px] border-[#FDF6F0] flex items-center justify-center transition-all duration-200 active:scale-90 shrink-0"
              aria-label="Products category view"
            >
              <span
                className="material-symbols-outlined text-white"
                style={{
                  fontSize: "24px",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                spa
              </span>
            </Link>
          </div>

          {/* Right items (Wishlist, Cart) */}
          {navItemsRight.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-2 transition-all duration-200 active:scale-90"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute top-0.5 w-1 h-1 rounded-full"
                    style={{ background: "#8B3A5E" }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "20px",
                    color: active ? "#8B3A5E" : "rgba(90,58,44,0.38)",
                    fontVariationSettings: `'FILL' ${active ? 1 : 0}`,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </span>
                
                {item.href === "/cart" && itemCount > 0 && (
                  <span
                    className="absolute top-1.5 right-[18px] min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center font-body text-[9px] font-semibold"
                    style={{
                      background: "#8B3A5E",
                      color: "#fff",
                    }}
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
                
                <span
                  className="font-body text-[10px] leading-none"
                  style={{
                    color: active ? "#8B3A5E" : "rgba(90,58,44,0.38)",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.04em",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

        </div>
      </div>
    </div>
  );
}
