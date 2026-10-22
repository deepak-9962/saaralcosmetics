"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ComboWithProducts } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ComboIncludedItemsProps {
  comboId?: string;
  combo: ComboWithProducts | null | undefined;
  isLoading?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function ComboIncludedItems({
  comboId,
  combo,
  isLoading = false,
  isExpanded,
  onToggle,
  isMobile = false,
}: ComboIncludedItemsProps) {
  const effectiveComboId = comboId || combo?.id || "combo";
  const panelId = `combo-items-panel-${effectiveComboId}`;
  const buttonId = `combo-toggle-btn-${effectiveComboId}`;

  const items = combo?.items ?? [];
  const productCount = items.length;

  // Calculate individual value if prices are known
  const individualSum = items.reduce((sum, it) => {
    return sum + (it.product?.price ? Number(it.product.price) * (it.quantity || 1) : 0);
  }, 0);

  const comboPrice = combo ? Number(combo.price) : 0;
  const hasSavings = individualSum > comboPrice && comboPrice > 0;
  const savings = individualSum - comboPrice;

  return (
    <div className="w-full mt-1.5 flex flex-col gap-1.5">
      {/* ── Tertiary count & Expand/Collapse Toggle Button ── */}
      <div className="flex items-center gap-2 flex-wrap text-[11px] sm:text-[12px]">
        {isLoading ? (
          <span className="font-body text-on-surface-variant/60 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-ping" />
            Loading included items...
          </span>
        ) : productCount > 0 ? (
          <span className="font-body text-on-surface-variant font-medium">
            {productCount} {productCount === 1 ? "product" : "products"} included
          </span>
        ) : (
          <span className="font-body text-on-surface-variant/70 italic">
            Combo details unavailable
          </span>
        )}

        {productCount > 0 && !isLoading && (
          <button
            type="button"
            id={buttonId}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            aria-label={
              isExpanded
                ? `Hide ${productCount} items included in combo`
                : `View ${productCount} items included in combo`
            }
            className="inline-flex items-center gap-0.5 font-body font-semibold text-primary hover:text-[#9d4d6e] active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1.5 py-0.5 bg-primary/5 hover:bg-primary/10 border border-primary/15"
          >
            <span>{isExpanded ? "Hide items" : "View items"}</span>
            <ChevronDown
              size={13}
              strokeWidth={2.4}
              className={`transition-transform duration-200 ease-out ${
                isExpanded ? "rotate-180 text-primary" : "text-primary/70"
              }`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* ── Expanded Content (Subtle, Accessible, Lightweight) ── */}
      {isExpanded && productCount > 0 && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className={`w-full rounded-xl border border-[#EFE6E1] bg-[#FAF5F2]/80 backdrop-blur-[2px] transition-opacity duration-200 ${
            isMobile ? "p-2.5 space-y-2 mt-1" : "p-3 space-y-2.5 mt-2"
          }`}
        >
          {/* Header title inside panel */}
          <div className="flex items-center justify-between border-b border-[#EFE6E1]/80 pb-1.5">
            <span className="font-body text-[10.5px] uppercase tracking-wider font-bold text-on-surface-variant/80">
              Box Contents
            </span>
            <span className="font-body text-[10px] text-on-surface-variant/60">
              Included in this set
            </span>
          </div>

          {/* List of included products */}
          <div className="space-y-1.5 divide-y divide-[#EFE6E1]/50">
            {items.map((it) => {
              const product = it.product;
              const hasProduct = Boolean(product);
              const thumbnail = product?.images?.[0] || "/images/card1.webp";
              const isOutOfStock = Boolean(product && product.stock <= 0);

              return (
                <div
                  key={it.id}
                  className="pt-1.5 first:pt-0 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div
                      className={`relative rounded-lg overflow-hidden bg-white shrink-0 border border-outline-variant/30 shadow-xs ${
                        isMobile ? "w-8 h-8" : "w-9 h-9"
                      }`}
                    >
                      <Image
                        src={thumbnail}
                        alt={product?.name || "Included Product"}
                        fill
                        className="object-cover"
                        sizes="36px"
                        unoptimized={thumbnail.startsWith("http")}
                      />
                    </div>

                    {/* Product Name & Link */}
                    <div className="min-w-0 flex-1">
                      {hasProduct && product?.slug ? (
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-body text-[12px] font-semibold text-on-surface hover:text-primary transition-colors truncate block leading-snug hover:underline underline-offset-2"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <p className="font-body text-[12px] font-medium text-on-surface-variant/80 italic truncate leading-snug">
                          {product?.name || "Product currently unavailable"}
                        </p>
                      )}

                      {/* Category / Variant subtitle if available */}
                      {product?.category && (
                        <p className="font-body text-[10px] text-on-surface-variant/70 capitalize truncate">
                          {product.category.replace(/-/g, " ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity and stock status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOutOfStock && (
                      <span className="font-body text-[9px] font-bold text-red-600 bg-red-50 border border-red-200/70 px-1.5 py-0.5 rounded uppercase">
                        Out of stock
                      </span>
                    )}
                    <span className="font-body text-[11px] font-semibold text-on-surface-variant bg-white px-2 py-0.5 rounded-md border border-outline-variant/30 shadow-xs tabular-nums">
                      Qty: {it.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Optional Savings / Total Value Note ── */}
          {hasSavings && (
            <div className="pt-2 border-t border-[#EFE6E1] flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <span className="font-body text-on-surface-variant/80">
                Individual value:{" "}
                <span className="line-through text-on-surface-variant/60">
                  {formatPrice(individualSum)}
                </span>
              </span>
              <span className="font-body font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                You save {formatPrice(savings)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
