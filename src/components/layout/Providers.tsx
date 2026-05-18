"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2200,
            style: {
              background: "#12100F",
              color: "#fff",
              border: "1px solid rgba(201,169,110,0.35)",
              borderRadius: "999px",
              padding: "12px 18px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#B06080",
                secondary: "#12100F",
              },
            },
          }}
        />
      </WishlistProvider>
    </CartProvider>
  );
}
