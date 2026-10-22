import { getSupabaseBrowserClient } from "./supabase/client";
import { normalizeProduct } from "./supabase/data";
import { CATEGORIES, type DestinationType, type Product } from "./types";

export interface CategoryOption {
  id: string;
  slug: string;
  label: string;
  icon: string;
  is_active?: boolean;
}

/**
 * Builds the canonical public URL for a chosen destination.
 */
export function buildDestinationUrl(
  type: DestinationType,
  id: string,
  productSlug?: string,
  categorySlug?: string
): string {
  if (type === "category") {
    if (!id || id === "all") return "/products";
    const slug = categorySlug || id;
    return `/products?category=${encodeURIComponent(slug)}`;
  }

  if (type === "product") {
    const slug = productSlug || id;
    if (!slug) return "/products";
    return `/products/${encodeURIComponent(slug)}`;
  }

  // Custom URL
  if (!id || !id.trim()) return "/products";
  return id.trim();
}

/**
 * Parses existing raw link URLs or stored structured fields into a coherent Destination state.
 * Ensures 100% backward compatibility for existing records that stored raw URLs.
 */
export function parseDestination(
  url?: string | null,
  rawType?: string | null,
  rawId?: string | null,
  rawProductId?: string | null
): {
  type: DestinationType;
  id: string;
  productId: string | null;
} {
  // Migrate legacy #/combos or /combos to real Combos category
  const cleanUrl = (url || "").trim();
  if (
    cleanUrl === "#/combos" ||
    cleanUrl === "/combos" ||
    rawId === "#/combos" ||
    rawId === "/combos"
  ) {
    return {
      type: "category",
      id: rawId && rawId.length === 36 ? rawId : "combos",
      productId: null,
    };
  }

  // If structured fields exist and are valid
  if (
    rawType &&
    (rawType === "category" || rawType === "product" || rawType === "custom") &&
    rawId
  ) {
    return {
      type: rawType as DestinationType,
      id: rawId,
      productId: rawProductId || (rawType === "product" ? rawId : null),
    };
  }
  if (!cleanUrl) {
    return { type: "category", id: "all", productId: null };
  }

  // Check for category pattern: e.g. /products?category=nalangu-maavu
  const catMatch = cleanUrl.match(/[?&]category=([^&#]+)/);
  if (catMatch) {
    return {
      type: "category",
      id: decodeURIComponent(catMatch[1]),
      productId: null,
    };
  }

  // Check for root all-products catalog: /products
  if (cleanUrl === "/products" || cleanUrl === "/products/") {
    return { type: "category", id: "all", productId: null };
  }

  // Check for product detail pattern: e.g. /products/butterfly-pea-facewash-sangoo-poo
  const prodMatch = cleanUrl.match(/^\/products\/([^/?#]+)$/);
  if (prodMatch) {
    const slugOrId = decodeURIComponent(prodMatch[1]);
    return {
      type: "product",
      id: slugOrId,
      productId: rawProductId || null,
    };
  }

  // Default to custom URL
  return {
    type: "custom",
    id: cleanUrl,
    productId: null,
  };
}

/**
 * Fetch available product categories from Supabase categories table,
 * preserving display_order and active status.
 */
export async function fetchAvailableCategories(onlyActive = true): Promise<CategoryOption[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("categories")
      .select("id, name, slug, display_order, is_active")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.warn("Falling back to standard categories for selector:", error?.message);
      return CATEGORIES.map((c) => ({
        id: c.slug,
        slug: c.slug,
        label: c.slug === "all" ? "All Products (Catalog)" : c.label,
        icon: c.icon,
        is_active: true,
      }));
    }

    const results: CategoryOption[] = [
      { id: "all", slug: "all", label: "All Products (Catalog)", icon: "apps", is_active: true },
    ];

    const iconMap: Record<string, string> = {
      "face-cream": "spa",
      "face-wash": "water_drop",
      soap: "clean_hands",
      "nalangu-maavu": "potted_plant",
      oil: "opacity",
      balm: "healing",
      combos: "auto_awesome_motion",
    };

    data.forEach((cat: any) => {
      results.push({
        id: cat.id,
        slug: cat.slug,
        label: cat.name,
        icon: iconMap[cat.slug] || "category",
        is_active: cat.is_active,
      });
    });

    return results;
  } catch (err) {
    console.error("Error fetching categories for destination selector:", err);
    return CATEGORIES.map((c) => ({
      id: c.slug,
      slug: c.slug,
      label: c.slug === "all" ? "All Products (Catalog)" : c.label,
      icon: c.icon,
      is_active: true,
    }));
  }
}

/**
 * Searches the live products catalogue by name/slug for the destination selector.
 */
export async function searchProductsForDestination(
  searchTerm: string,
  limit = 12
): Promise<Product[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(limit);

    const term = searchTerm.trim();
    if (term) {
      query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error searching products:", error);
      return [];
    }

    return (data || []).map((row) => normalizeProduct(row as any));
  } catch (err) {
    console.error("Failed to query products for destination selector:", err);
    return [];
  }
}
