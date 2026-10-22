"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  fetchAvailableCategories,
  searchProductsForDestination,
  buildDestinationUrl,
  parseDestination,
  type CategoryOption,
} from "@/lib/destination";
import type { DestinationType, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export interface DestinationValue {
  type: DestinationType;
  id: string; // Category ID or slug, product ID or slug, or custom URL
  categoryId?: string | null;
  categorySlug?: string | null;
  productId?: string | null;
  productSlug?: string | null;
  productName?: string | null;
  url: string; // Generated route (e.g. /products?category=soap or /products/redwine-facewash)
  isValid: boolean;
}

interface DestinationSelectorProps {
  initialType?: DestinationType | null;
  initialId?: string | null;
  initialProductId?: string | null;
  initialUrl?: string | null;
  onChange: (val: DestinationValue) => void;
  label?: string;
  required?: boolean;
}

export default function DestinationSelector({
  initialType,
  initialId,
  initialProductId,
  initialUrl,
  onChange,
  label = "Destination",
  required = true,
}: DestinationSelectorProps) {
  // Parse initial state safely
  const parsed = parseDestination(
    initialUrl,
    initialType,
    initialId,
    initialProductId
  );

  const [type, setType] = useState<DestinationType>(parsed.type);
  const [selectedId, setSelectedId] = useState<string>(parsed.id);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    parsed.productId
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Categories list
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  // Product search state
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productSearchContainerRef = useRef<HTMLDivElement>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Load categories once on mount
  useEffect(() => {
    let active = true;
    setLoadingCats(true);
    fetchAvailableCategories()
      .then((cats) => {
        if (!active) return;
        setCategories(cats);
        // If initial type was category, resolve to actual category ID
        if (parsed.type === "category") {
          const matched = cats.find(
            (c) => c.id === parsed.id || c.slug === parsed.id
          );
          if (matched) {
            setSelectedId(matched.id);
            onChangeRef.current({
              type: "category",
              id: matched.id,
              categoryId: matched.id,
              categorySlug: matched.slug,
              productId: null,
              productSlug: null,
              productName: null,
              url: buildDestinationUrl("category", matched.id, undefined, matched.slug),
              isValid: true,
            });
          }
        }
      })
      .finally(() => {
        if (active) setLoadingCats(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // If initial type was product and we have an ID/slug, load product info to display nicely
  useEffect(() => {
    let active = true;
    if (parsed.type === "product" && parsed.id) {
      searchProductsForDestination(parsed.id, 5).then((results) => {
        if (!active) return;
        const found = results.find(
          (p) =>
            p.id === parsed.id ||
            p.slug === parsed.id ||
            p.id === parsed.productId
        );
        if (found) {
          setSelectedProduct(found);
          setSelectedProductId(found.id);
        } else {
          setSelectedProduct(null);
          setSelectedProductId(null);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [parsed.id, parsed.productId, parsed.type]);

  // Close product search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        productSearchContainerRef.current &&
        !productSearchContainerRef.current.contains(e.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products debounced
  useEffect(() => {
    if (type !== "product") return;
    let active = true;
    setIsSearchingProduct(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchProductsForDestination(productSearchTerm, 8);
        if (active) {
          setProductResults(results);
        }
      } catch (err) {
        console.error("Product search error:", err);
      } finally {
        if (active) setIsSearchingProduct(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [productSearchTerm, type]);


  const emitChange = (
    nextType: DestinationType,
    nextId: string,
    nextProductId: string | null,
    nextProduct: Product | null
  ) => {
    let isValid = false;
    let computedUrl = "/products";

    if (nextType === "category") {
      const cat = categories.find((c) => c.id === nextId || c.slug === nextId);
      const isFound = Boolean(cat) || nextId === "all";
      isValid = isFound && Boolean(nextId && nextId.trim().length > 0);
      computedUrl = buildDestinationUrl("category", nextId, undefined, cat?.slug);

      onChangeRef.current({
        type: nextType,
        id: cat?.id || nextId,
        categoryId: cat?.id || (nextId.length === 36 ? nextId : null),
        categorySlug: cat?.slug || (nextId === "all" ? "all" : null),
        productId: null,
        productSlug: null,
        productName: null,
        url: computedUrl,
        isValid,
      });
      return;
    } else if (nextType === "product") {
      isValid = Boolean(
        (nextProduct && nextProduct.slug) || (nextId && nextId.trim().length > 0)
      );
      const slug = nextProduct?.slug || nextId;
      computedUrl = buildDestinationUrl("product", slug);

      onChangeRef.current({
        type: nextType,
        id: nextId,
        productId: nextProductId,
        productSlug: nextProduct?.slug || null,
        productName: nextProduct?.name || null,
        url: computedUrl,
        isValid,
      });
      return;
    } else if (nextType === "custom") {
      isValid = Boolean(nextId && nextId.trim().length > 0);
      computedUrl = buildDestinationUrl("custom", nextId);

      onChangeRef.current({
        type: nextType,
        id: nextId,
        productId: null,
        productSlug: null,
        productName: null,
        url: computedUrl,
        isValid,
      });
      return;
    }
  };

  const handleTypeChange = (newType: DestinationType) => {
    setType(newType);
    if (newType === "category") {
      const defaultCat = categories[1]?.id || categories[0]?.id || "all";
      setSelectedId(defaultCat);
      setSelectedProduct(null);
      setSelectedProductId(null);
      emitChange("category", defaultCat, null, null);
    } else if (newType === "product") {
      setSelectedId("");
      setSelectedProduct(null);
      setSelectedProductId(null);
      setProductSearchTerm("");
      emitChange("product", "", null, null);
    } else if (newType === "custom") {
      setSelectedId("/products");
      setSelectedProduct(null);
      setSelectedProductId(null);
      emitChange("custom", "/products", null, null);
    }
  };

  const handleCategoryChange = (val: string) => {
    setSelectedId(val);
    emitChange("category", val, null, null);
  };

  const handleCustomUrlChange = (val: string) => {
    setSelectedId(val);
    emitChange("custom", val, null, null);
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedProductId(prod.id);
    setSelectedId(prod.slug);
    setShowProductDropdown(false);
    setProductSearchTerm("");
    emitChange("product", prod.slug, prod.id, prod);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setSelectedProductId(null);
    setSelectedId("");
    setProductSearchTerm("");
    emitChange("product", "", null, null);
  };

  const currentCategory =
    type === "category"
      ? categories.find((c) => c.id === selectedId || c.slug === selectedId)
      : null;

  const generatedUrl =
    type === "category"
      ? buildDestinationUrl("category", selectedId, undefined, currentCategory?.slug)
      : type === "product"
      ? buildDestinationUrl("product", selectedProduct?.slug || selectedId)
      : buildDestinationUrl("custom", selectedId);

  return (
    <div className="space-y-3.5 p-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest/60">
      <div className="flex items-center justify-between">
        <label className="block font-body text-[12px] font-semibold tracking-wider uppercase text-on-surface-variant">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        <span className="font-body text-[11px] text-on-surface-variant/70">
          Auto-generates clean internal routes
        </span>
      </div>

      {/* ── Type Selector Tabs ── */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-container-high/60 border border-outline-variant/40">
        <button
          type="button"
          onClick={() => handleTypeChange("category")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-body text-[12px] font-semibold transition-all ${
            type === "category"
              ? "bg-white text-primary shadow-sm border border-outline-variant/30"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">category</span>
          <span>Category</span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange("product")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-body text-[12px] font-semibold transition-all ${
            type === "product"
              ? "bg-white text-primary shadow-sm border border-outline-variant/30"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
          <span>Product</span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange("custom")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-body text-[12px] font-semibold transition-all ${
            type === "custom"
              ? "bg-white text-primary shadow-sm border border-outline-variant/30"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">link</span>
          <span>Custom URL</span>
        </button>
      </div>

      {/* ── 1. Category Destination Dropdown ── */}
      {type === "category" && (
        <div className="space-y-1.5">
          <label className="block font-body text-[11px] font-medium text-on-surface-variant">
            Select Product Category:
          </label>
          {loadingCats ? (
            <div className="flex items-center gap-2 py-2 px-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface-variant text-[13px]">
              <span className="material-symbols-outlined animate-spin text-[16px]">
                progress_activity
              </span>
              <span>Loading catalogue categories...</span>
            </div>
          ) : (
            <>
              <select
                value={selectedId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[13.5px] focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} {cat.slug === "all" ? "(Full Catalog)" : `(/products?category=${cat.slug})`}
                  </option>
                ))}
              </select>
              {selectedId &&
                selectedId !== "all" &&
                !categories.some((c) => c.id === selectedId || c.slug === selectedId) && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12px]">
                    <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                    <span>
                      The previously assigned category is no longer available or was removed. Please re-select an active category.
                    </span>
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {/* ── 2. Product Destination Search & Select ── */}
      {type === "product" && (
        <div className="space-y-2" ref={productSearchContainerRef}>
          <label className="block font-body text-[11px] font-medium text-on-surface-variant">
            Select Specific Product from Catalogue:
          </label>

          {/* If a product is already selected, show high-fidelity selected card */}
          {selectedProduct ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/40 shrink-0">
                  {selectedProduct.images?.[0] ? (
                    <Image
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                      <span className="material-symbols-outlined text-[18px]">spa</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-[13px] font-semibold text-on-surface truncate">
                    {selectedProduct.name}
                  </p>
                  <p className="font-body text-[11px] text-on-surface-variant flex items-center gap-2">
                    <span className="text-primary font-semibold">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{selectedProduct.category.replace(/-/g, " ")}</span>
                    {selectedProduct.variant_name && (
                      <>
                        <span>•</span>
                        <span>{selectedProduct.variant_name}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(true)}
                  className="px-2.5 py-1.5 rounded-lg border border-outline-variant/60 text-on-surface font-body text-[11px] font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClearProduct}
                  title="Remove selection"
                  className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Search bar & dropdown */}
          {(!selectedProduct || showProductDropdown) && (
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by title or keyword..."
                  value={productSearchTerm}
                  onFocus={() => setShowProductDropdown(true)}
                  onChange={(e) => {
                    setProductSearchTerm(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[13px] focus:outline-none focus:border-primary transition-colors"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px]">
                  search
                </span>
                {isSearchingProduct && (
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-primary animate-spin text-[16px]">
                    progress_activity
                  </span>
                )}
              </div>

              {/* Product Search Results Dropdown */}
              {showProductDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-outline-variant/60 bg-white shadow-xl py-1 divide-y divide-outline-variant/20">
                  {productResults.length === 0 ? (
                    <div className="py-4 px-3 text-center text-on-surface-variant/60 font-body text-[12px]">
                      {isSearchingProduct ? "Searching products..." : "No products found matching query."}
                    </div>
                  ) : (
                    productResults.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-surface-container-high/60 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface-container shrink-0">
                            {prod.images?.[0] ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                                <span className="material-symbols-outlined text-[14px]">spa</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-[12.5px] font-semibold text-on-surface truncate">
                              {prod.name}
                            </p>
                            <p className="font-body text-[10.5px] text-on-surface-variant/70">
                              {formatPrice(prod.price)} • {prod.category}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-primary shrink-0 ml-2">
                          Select
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {!selectedProduct && (
            <p className="font-body text-[11px] text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Please search and select a product for this slide destination.
            </p>
          )}
        </div>
      )}

      {/* ── 3. Custom URL Input ── */}
      {type === "custom" && (
        <div className="space-y-1.5">
          <label className="block font-body text-[11px] font-medium text-on-surface-variant">
            Enter Internal Path or External URL:
          </label>
          <input
            type="text"
            required
            placeholder="e.g. /blog or /about or https://example.com"
            value={selectedId}
            onChange={(e) => handleCustomUrlChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-body text-[13.5px] focus:outline-none focus:border-primary transition-colors"
          />
          <p className="font-body text-[11px] text-on-surface-variant/70">
            For special campaigns, blogs, or external partner links.
          </p>
        </div>
      )}

      {/* ── Destination Route Preview ── */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-[11px]">
        <span className="font-body text-on-surface-variant/70">
          Generated Route:
        </span>
        <code className="font-mono text-primary font-semibold px-2 py-0.5 rounded bg-primary/10">
          {generatedUrl || "/products"}
        </code>
      </div>
    </div>
  );
}
