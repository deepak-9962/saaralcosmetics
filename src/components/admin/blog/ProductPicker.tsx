"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MOCK_PRODUCTS } from "@/lib/products";
import type { ProductWithImages } from "@/lib/types";

interface ProductPickerProps {
  onSelect: (product: { name: string; slug: string; url: string }) => void;
}

export default function ProductPicker({ onSelect }: ProductPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductWithImages[]>([]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        let query = supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (searchTerm.trim()) {
          query = query.ilike("name", `%${searchTerm.trim()}%`);
        }

        const { data, error } = await query.limit(10);

        if (error || !data || data.length === 0) {
          // Fallback to MOCK_PRODUCTS matching search
          const filtered = MOCK_PRODUCTS.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
          ).slice(0, 10);
          if (!isCancelled) {
            setProducts(
              filtered.map((p) => ({
                ...p,
                product_images: p.images.map((img, i) => ({
                  id: `img-${i}`,
                  product_id: p.id,
                  image_url: img,
                  image_path: img,
                  display_order: i,
                  alt_text: p.name,
                  created_at: new Date().toISOString(),
                })),
              }))
            );
          }
        } else if (!isCancelled) {
          setProducts(data as ProductWithImages[]);
        }
      } catch (err) {
        console.error("Failed to search products:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-on-surface text-[14px] focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="max-h-60 overflow-y-auto rounded-lg border border-outline-variant/40 divide-y divide-outline-variant/20 bg-surface">
        {loading ? (
          <div className="p-4 text-center text-[13px] text-on-surface-variant flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            Searching products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-4 text-center text-[13px] text-on-surface-variant">
            No products found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          products.map((p) => {
            const thumbUrl =
              p.product_images?.find((img) => img.display_order === 0)?.image_url ||
              p.product_images?.[0]?.image_url ||
              p.images?.[0] ||
              "/images/hero.webp";

            const pdpUrl = `/products/${p.slug}`;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  onSelect({
                    name: p.name,
                    slug: p.slug,
                    url: pdpUrl,
                  })
                }
                className="w-full flex items-center gap-3 p-2.5 hover:bg-surface-container-high text-left transition-colors group"
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-surface-container flex-shrink-0 relative border border-outline-variant/30">
                  <Image
                    src={thumbUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[13px] font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <p className="font-body text-[11px] text-on-surface-variant font-mono">
                    ₹{p.price} {p.variant_name ? `• ${p.variant_name}` : ""}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
                  link
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
