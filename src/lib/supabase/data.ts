import { generateOrderNumber, generateSlug } from "@/lib/utils";
import type {
  CartItem,
  Category,
  CategoryFilter,
  CategoryInput,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductWithImages,
  HeroSlide,
  HeroSlideInput,
  HomepageCategory,
  HomepageCategoryInput,
  Combo,
  ComboItem,
  ComboItemWithProduct,
  ComboWithProducts,
  ComboInput,
  ProductReview,
  ProductReviewWithProduct,
  ProductReviewSummary,
  ProductRatingSnapshot,
  ReviewInput,
  ReviewStatus,
  CustomerTransformation,
  CustomerTransformationInput,
  HomepageTestimonial,
  HomepageTestimonialInput,
} from "@/lib/types";
import { getSupabaseBrowserClient } from "./client";
import type { Database, Json } from "./database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type HeroSlideRow = Database["public"]["Tables"]["hero_slides"]["Row"];
type HomepageCategoryRow = Database["public"]["Tables"]["homepage_categories"]["Row"];
type ComboRow = Database["public"]["Tables"]["combos"]["Row"];
type ProductReviewRow = Database["public"]["Tables"]["product_reviews"]["Row"];

// ============================================================
// TYPES
// ============================================================

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  order_count: number;
  total_spent: number;
  first_seen_at: string;
  last_seen_at: string;
}

// ============================================================
// NORMALIZERS
// ============================================================

const CATEGORY_FALLBACK_IMAGE: Record<string, string> = {
  "face-cream": "/images/cat-face-cream.webp",
  "face-wash": "/images/cat-face-wash.webp",
  soap: "/images/cat-soap.webp",
  "nalangu-maavu": "/images/cat-nalangu-maavu.webp",
  oil: "/images/head-oil.webp",
  balm: "/images/head-balm.webp",
};

const DISALLOWED_PLACEHOLDER_HOSTS = new Set([
  "via.placeholder.com",
  "placehold.co",
  "placehold.it",
]);

function normalizeProductImages(images: string[] | null | undefined, category: string) {
  const cleanedImages = (images ?? [])
    .map((image) => image.trim())
    .filter((image) => image.length > 0)
    .filter((image) => {
      try {
        const parsed = new URL(image);
        return !DISALLOWED_PLACEHOLDER_HOSTS.has(parsed.hostname);
      } catch {
        return true;
      }
    });

  if (cleanedImages.length > 0) {
    return cleanedImages;
  }

  return [CATEGORY_FALLBACK_IMAGE[category] || "/images/cat-face-cream.webp"];
}

function normalizeProductCategory(row: ProductRow): string {
  if (row.category) return row.category;
  if (
    row.slug === "advanced-foot-repair-balm" ||
    row.slug === "advanced-vetpalai-itching-balm" ||
    row.name.toLowerCase().includes("balm")
  ) {
    return "balm";
  }
  if (
    row.name.toLowerCase().includes(" oil") ||
    row.name.toLowerCase().endsWith("oil")
  ) {
    return "oil";
  }
  return "face-cream";
}

export function normalizeProduct(row: ProductRow): Product {
  const category = normalizeProductCategory(row);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category,
    category_id: row.category_id ?? null,
    variant_name: row.variant_name,
    price: row.price,
    compare_price: row.compare_price,
    description: row.description,
    ingredients: row.ingredients,
    how_to_use: row.how_to_use,
    images: normalizeProductImages(row.images, category),
    // image_path stores the Supabase Storage bucket-relative path (used for deletion)
    image_path: (row as typeof row & { image_path?: string | null }).image_path ?? null,
    stock: row.stock,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeOrder(row: OrderRow): Order {
  return {
    id: row.id,
    user_id: (row as any).user_id ?? null,
    order_number: row.order_number,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_email: row.customer_email,
    address_line1: row.address_line1,
    address_line2: row.address_line2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    items: parseOrderItems(row.items),
    subtotal: row.subtotal,
    shipping_charge: row.shipping_charge,
    total: row.total,
    payment_status: row.payment_status,
    razorpay_order_id: row.razorpay_order_id,
    razorpay_payment_id: row.razorpay_payment_id,
    order_status: row.order_status,
    notes: row.notes,
    promo_code_snapshot: (row as any).promo_code_snapshot ?? null,
    discount_type_snapshot: (row as any).discount_type_snapshot ?? null,
    discount_amount: (row as any).discount_amount ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    order_count: row.order_count,
    total_spent: row.total_spent,
    first_seen_at: row.first_seen_at,
    last_seen_at: row.last_seen_at,
  };
}

function parseOrderItems(items: Json): OrderItem[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];

    const productId = entry["product_id"];
    const name = entry["name"];
    const variant = entry["variant"];
    const qty = entry["qty"];
    const price = entry["price"];
    const image = entry["image"];

    if (
      typeof productId !== "string" ||
      typeof name !== "string" ||
      (typeof variant !== "string" && variant !== null) ||
      typeof qty !== "number" ||
      typeof price !== "number" ||
      (typeof image !== "string" && typeof image !== "undefined")
    ) {
      return [];
    }

    return [{ product_id: productId, name, variant, qty, price, image }];
  });
}

// ============================================================
// PRODUCTS — READ
// ============================================================

export async function listProducts(category: CategoryFilter = "all"): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient() as any;
  const query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const uniqueProducts: Product[] = [];
  const seenNames = new Set<string>();
  (data ?? []).forEach((row: any) => {
    const normalized = normalizeProduct(row);
    if (category !== "all" && normalized.category !== category && normalized.category_id !== category) {
      return;
    }
    if (!seenNames.has(normalized.name)) {
      seenNames.add(normalized.name);
      uniqueProducts.push(normalized);
    }
  });

  return uniqueProducts;
}

export async function listFeaturedProducts(limit = 3): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw new Error(error.message);

  const uniqueProducts: Product[] = [];
  const seenNames = new Set<string>();
  (data ?? []).forEach((row: any) => {
    const normalized = normalizeProduct(row);
    if (!seenNames.has(normalized.name)) {
      seenNames.add(normalized.name);
      uniqueProducts.push(normalized);
    }
  });

  return uniqueProducts.slice(0, limit);
}

export async function getProductVariants(name: string): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("name", name)
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeProduct(data);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeProduct(data);
}

export async function listRelatedProducts(
  currentSlug: string,
  category: Product["category"],
  limit = 4
): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .neq("slug", currentSlug)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeProduct);
}

export async function listAllProductsForAdmin(): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeProduct);
}

/**
 * Given a list of product/combo IDs already in the cart, returns the subset that
 * are still active in the database. Used to auto-remove deactivated items.
 * Supports both standalone products and combo packs (verifying combo active status
 * and that all included products are active and in stock).
 */
export async function getActiveProductIds(productIds: string[]): Promise<Set<string>> {
  if (productIds.length === 0) return new Set();
  const supabase = getSupabaseBrowserClient() as any;

  // 1. Check products
  const { data: productsData, error: prodErr } = await supabase
    .from("products")
    .select("id, is_active, stock")
    .in("id", productIds)
    .eq("is_active", true);

  if (prodErr) throw new Error(prodErr.message);
  const activeSet = new Set<string>((productsData ?? []).map((row: any) => row.id));

  // 2. Check any remaining IDs against combos
  const remainingIds = productIds.filter((id) => !activeSet.has(id));
  if (remainingIds.length > 0) {
    const { data: combosData, error: comboErr } = await supabase
      .from("combos")
      .select(`
        id,
        is_active,
        combo_items (
          quantity,
          products (
            id,
            is_active,
            stock
          )
        )
      `)
      .in("id", remainingIds)
      .eq("is_active", true);

    if (!comboErr && combosData) {
      for (const c of combosData) {
        const items = c.combo_items ?? [];
        // Combo is active and purchasable only if it has items and all items are in stock
        const allInStock =
          items.length > 0 &&
          items.every((it: any) => {
            const p = it.products;
            return p && p.is_active && (p.stock ?? 0) >= (it.quantity ?? 1);
          });
        if (allInStock) {
          activeSet.add(c.id);
        }
      }
    }
  }

  return activeSet;
}



// ============================================================
// PRODUCTS — WRITE
// ============================================================

export interface CreateProductInput {
  name: string;
  category: string;
  category_id?: string | null;
  variant_name: string | null;
  price: number;
  compare_price: number | null;
  description: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  images: string[];
  stock: number;
  is_active: boolean;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const supabase = getSupabaseBrowserClient() as any;
  let categoryId = input.category_id || null;
  let categorySlug = input.category;

  if (categoryId && !categorySlug) {
    const { data: cat } = await supabase.from("categories").select("slug").eq("id", categoryId).maybeSingle();
    if (cat) categorySlug = cat.slug;
  } else if (!categoryId && categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
    if (cat) categoryId = cat.id;
  }

  const payload: ProductInsert = {
    name: input.name,
    slug: generateSlug(input.name, input.variant_name ?? undefined),
    category: categorySlug || "face-cream",
    category_id: categoryId,
    variant_name: input.variant_name,
    price: input.price,
    compare_price: input.compare_price,
    description: input.description,
    ingredients: input.ingredients,
    how_to_use: input.how_to_use,
    images: input.images,
    stock: input.stock,
    is_active: input.is_active,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload as any)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export async function updateProduct(productId: string, input: UpdateProductInput): Promise<Product> {
  const supabase = getSupabaseBrowserClient() as any;

  let updatePayload: any = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  if (input.category_id && !input.category) {
    const { data: cat } = await supabase.from("categories").select("slug").eq("id", input.category_id).maybeSingle();
    if (cat) updatePayload.category = cat.slug;
  } else if (!input.category_id && input.category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", input.category).maybeSingle();
    if (cat) updatePayload.category_id = cat.id;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", productId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

export async function updateProductActive(productId: string, isActive: boolean): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() } as any)
    .eq("id", productId)
    .select("id");

  if (error) throw new Error(error.message);
  // If no rows returned, the update was silently blocked (RLS policy)
  if (!data || data.length === 0) {
    throw new Error(
      "Update failed: no rows were modified. Check that your Supabase RLS policy allows UPDATE on the products table."
    );
  }

}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);
}

/**
 * Deletes a product's Storage file first, then removes the DB row.
 *
 * The Storage delete uses the authenticated browser client — the authenticated
 * RLS policy on storage.objects allows signed-in admins to DELETE from the
 * "product-images" bucket.
 *
 * @param productId  - UUID of the products row to delete
 * @param imagePath  - Supabase Storage path (e.g. "3f8b2c1a-uuid.webp"). If null/undefined,
 *                     only the DB row is deleted.
 */
export async function deleteProductWithStorage(
  productId: string,
  imagePath?: string | null
): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;

  // Step 1: Remove the image from Storage (best-effort — don't fail if missing)
  if (imagePath) {
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([imagePath]);

    if (storageError) {
      // Log but do not throw — we still want to delete the DB row
      console.warn(
        `[deleteProductWithStorage] Could not remove storage file "${imagePath}": ${storageError.message}`
      );
    }
  }

  // Step 2: Delete the DB row
  const { error: dbError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (dbError) throw new Error(dbError.message);
}

// ============================================================
// ORDERS — READ & WRITE
// ============================================================

interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  items: CartItem[];
  subtotal: number;
  shipping_charge: number;
  total: number;
  // Promo / discount fields (all optional — null when no code applied)
  promo_code_snapshot?: string | null;
  discount_type_snapshot?: string | null;
  discount_amount?: number | null;
  user_id?: string | null;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = getSupabaseBrowserClient();
  const orderItemsPayload: Json[] = input.items.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    variant: item.variant_name,
    qty: item.quantity,
    price: item.price,
    image: item.image || null,
  }));

  const payload: OrderInsert = {
    order_number: generateOrderNumber(),
    user_id: input.user_id ?? null,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_email: input.customer_email,
    address_line1: input.address_line1,
    address_line2: input.address_line2,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    items: orderItemsPayload,
    subtotal: input.subtotal,
    shipping_charge: input.shipping_charge,
    total: input.total,
    payment_status: "pending",
    order_status: "new",
    promo_code_snapshot: input.promo_code_snapshot ?? null,
    discount_type_snapshot: input.discount_type_snapshot ?? null,
    discount_amount: input.discount_amount ?? null,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(payload as any)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  // The DB trigger `trg_sync_customer_on_order` auto-upserts the customer row
  return normalizeOrder(data);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeOrder(data);
}

export async function listOrders(): Promise<Order[]> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeOrder);
}

export async function updateOrderStatus(orderId: string, status: Order["order_status"]): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status } as any)
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function updateOrderPaymentStatus(
  orderId: string,
  status: Order["payment_status"]
): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status } as any)
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function updateOrderRazorpayDetails(
  orderId: string,
  details: {
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
    payment_status?: Order["payment_status"];
  }
): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase
    .from("orders")
    .update(details as any)
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}


export async function updateOrderNotes(orderId: string, notes: string | null): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase
    .from("orders")
    .update({ notes } as any)
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

// ============================================================
// CUSTOMERS — READ
// ============================================================

export async function listCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeCustomer);
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return normalizeCustomer(data);
}

export async function listOrdersByPhone(phone: string): Promise<Order[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeOrder);
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export function subscribeToOrders(
  onInsert: (order: Order) => void,
  onUpdate?: (order: Order) => void
) {
  const supabase = getSupabaseBrowserClient();
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(`orders-realtime-${uniqueId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => onInsert(normalizeOrder(payload.new as OrderRow))
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "orders" },
      (payload) => onUpdate?.(normalizeOrder(payload.new as OrderRow))
    )
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}

export function subscribeToProducts(onAnyChange: () => void) {
  const supabase = getSupabaseBrowserClient();
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(`products-realtime-${uniqueId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, onAnyChange)
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}

export function subscribeToCustomers(onAnyChange: () => void) {
  const supabase = getSupabaseBrowserClient();
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(`customers-realtime-${uniqueId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, onAnyChange)
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}

// ============================================================
// PRODUCT IMAGES — READ
// ============================================================

/**
 * Fetches a product with its FULL ordered gallery from product_images.
 * Use on the product detail page where all gallery images are displayed.
 *
 * Falls back gracefully: if the product has no product_images rows yet
 * (legacy products not yet migrated), the product_images array will be empty
 * and the caller can fall back to product.images[].
 *
 * @param productId UUID of the product
 * @returns ProductWithImages (product + ordered gallery) or null if not found
 */
export async function getProductWithImages(
  productId: string
): Promise<ProductWithImages | null> {
  const supabase = getSupabaseBrowserClient();

  // Parallel fetch: product row + all its gallery images
  const [productResult, imagesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).maybeSingle(),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true }),
  ]);

  if (productResult.error) throw new Error(productResult.error.message);
  if (!productResult.data) return null;

  const product = normalizeProduct(productResult.data);

  const images: ProductImage[] = (imagesResult.data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    image_url: row.image_url,
    image_path: row.image_path,
    display_order: row.display_order,
    alt_text: row.alt_text,
    created_at: row.created_at,
  }));

  return { ...product, product_images: images };
}

/**
 * Fetches all active products with ONLY their main/thumbnail image
 * (display_order = 0 from product_images). Optimised for listing and grid
 * pages (homepage, /products, category pages) where loading all 5-6 gallery
 * images per product would waste bandwidth.
 *
 * Falls back to product.images[0] for legacy products that have no
 * product_images rows yet — so nothing breaks during the migration window.
 *
 * @param category Optional category filter (default: "all")
 */
export async function getAllProductsWithMainImage(
  category: CategoryFilter = "all"
): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient() as any;

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data: productRows, error } = await query;
  if (error) throw new Error(error.message);
  if (!productRows?.length) return [];

  // Fetch ONLY display_order=0 images for these products.
  // This is O(1) extra queries regardless of product count.
  const productIds = productRows.map((r: any) => r.id);
  const { data: mainImages } = await supabase
    .from("product_images")
    .select("product_id, image_url")
    .in("product_id", productIds)
    .eq("display_order", 0);

  // Build a lookup: product_id → main image URL
  const mainImageMap = new Map<string, string>(
    (mainImages ?? []).map((img: any) => [img.product_id, img.image_url])
  );

  return productRows.map((row: any) => {
    const product = normalizeProduct(row);
    const mainImageUrl = mainImageMap.get(row.id);
    // Override images[0] with the product_images main image if available.
    // If the product has no product_images rows (legacy), images[] from
    // normalizeProduct() is used unchanged — backward compat preserved.
    if (mainImageUrl) {
      product.images = [mainImageUrl, ...product.images.slice(1)];
    }
    return product;
  });
}

// ============================================================
// AUTH
// ============================================================

export async function getAdminSessionUser() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return user;
}

// ============================================================
// CATEGORIES — CRUD
// ============================================================

export async function listCategories(onlyActive = true): Promise<Category[]> {
  const supabase = getSupabaseBrowserClient() as any;
  let query = supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing categories from DB:", error.message || error);
    // Fallback gracefully
    return [
      { id: "face-cream", name: "Face Cream", slug: "face-cream", description: null, display_order: 1, is_active: true, created_at: "", updated_at: "" },
      { id: "face-wash", name: "Face Wash", slug: "face-wash", description: null, display_order: 2, is_active: true, created_at: "", updated_at: "" },
      { id: "soap", name: "Soap", slug: "soap", description: null, display_order: 3, is_active: true, created_at: "", updated_at: "" },
      { id: "nalangu-maavu", name: "Nalangu Maavu", slug: "nalangu-maavu", description: null, display_order: 4, is_active: true, created_at: "", updated_at: "" },
      { id: "oil", name: "Herbal Oil", slug: "oil", description: null, display_order: 5, is_active: true, created_at: "", updated_at: "" },
      { id: "balm", name: "Herbal Balm", slug: "balm", description: null, display_order: 6, is_active: true, created_at: "", updated_at: "" },
    ];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    display_order: row.display_order ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Category;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as Category;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const supabase = getSupabaseBrowserClient() as any;
  const slug = input.slug?.trim() ? generateSlug(input.slug) : generateSlug(input.name);
  const payload: CategoryInsert = {
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    display_order: input.display_order ?? 0,
    is_active: input.is_active ?? true,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload as any)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating category:", error.message || error);
    throw new Error(error.message);
  }

  return data as Category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const supabase = getSupabaseBrowserClient() as any;
  const updatePayload: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updatePayload.name = input.name.trim();
  if (input.slug !== undefined) updatePayload.slug = generateSlug(input.slug);
  if (input.description !== undefined) updatePayload.description = input.description?.trim() || null;
  if (input.display_order !== undefined) updatePayload.display_order = input.display_order;
  if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

  const { data, error } = await supabase
    .from("categories")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating category:", error.message || error);
    throw new Error(error.message);
  }

  // If slug was updated, update products.category text string to stay in sync
  if (updatePayload.slug) {
    await supabase
      .from("products")
      .update({ category: updatePayload.slug })
      .eq("category_id", id);
  }

  return data as Category;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; affectedProducts: number }> {
  const supabase = getSupabaseBrowserClient() as any;

  // Check how many products reference this category
  const { data: prods } = await supabase
    .from("products")
    .select("id")
    .eq("category_id", id);

  const affectedCount = (prods ?? []).length;

  // Gracefully set foreign keys to null so no references break
  await supabase
    .from("products")
    .update({ category_id: null })
    .eq("category_id", id);

  await supabase
    .from("hero_slides")
    .update({ destination_category_id: null })
    .eq("destination_category_id", id);

  await supabase
    .from("homepage_categories")
    .update({ category_id: null })
    .eq("category_id", id);

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error.message || error);
    throw new Error(error.message);
  }

  return { success: true, affectedProducts: affectedCount };
}

// ============================================================
// HERO SLIDES — READ & WRITE
// ============================================================

function normalizeHeroSlide(row: any): HeroSlide {
  let computedLink = row.button_link || "/products";

  if (row.destination_type === "category") {
    if (row.categories && row.categories.slug) {
      computedLink = row.categories.is_active !== false
        ? (row.categories.slug === "all" ? "/products" : `/products?category=${encodeURIComponent(row.categories.slug)}`)
        : "/products";
    } else if (row.destination_id && !row.destination_id.includes("-")) {
      // If destination_id is a slug
      computedLink = row.destination_id === "all" ? "/products" : `/products?category=${encodeURIComponent(row.destination_id)}`;
    }
  }

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    image_url: row.image_url,
    mobile_image_url: row.mobile_image_url,
    button_text: row.button_text,
    button_link: computedLink,
    destination_type: row.destination_type || "category",
    destination_id: row.destination_id || null,
    product_id: row.product_id || null,
    destination_category_id: row.destination_category_id || (row.categories?.id ?? null),
    display_order: row.display_order ?? 0,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listHeroSlides(onlyActive = true): Promise<HeroSlide[]> {
  const supabase = getSupabaseBrowserClient() as any;
  let query = supabase
    .from("hero_slides")
    .select("*, categories:destination_category_id(*)")
    .order("display_order", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing hero slides:", error);
    return [];
  }
  return (data ?? []).map(normalizeHeroSlide);
}

export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlide> {
  const supabase = getSupabaseBrowserClient() as any;
  let categoryId = input.destination_category_id || null;
  if (!categoryId && input.destination_type === "category" && input.destination_id) {
    // If destination_id is UUID or slug, resolve it
    if (input.destination_id.length === 36 && input.destination_id.includes("-")) {
      categoryId = input.destination_id;
    } else {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", input.destination_id).maybeSingle();
      if (cat) categoryId = cat.id;
    }
  }

  const { data, error } = await supabase
    .from("hero_slides")
    .insert({
      title: input.title,
      subtitle: input.subtitle || null,
      description: input.description || null,
      image_url: input.image_url,
      mobile_image_url: input.mobile_image_url || null,
      button_text: input.button_text || null,
      button_link: input.button_link || "/products",
      destination_type: input.destination_type || "category",
      destination_id: input.destination_id || null,
      product_id: input.product_id || null,
      destination_category_id: categoryId,
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select("*, categories:destination_category_id(*)")
    .single();

  if (error) throw new Error(error.message);
  return normalizeHeroSlide(data);
}

export async function updateHeroSlide(id: string, input: Partial<HeroSlideInput>): Promise<HeroSlide> {
  const supabase = getSupabaseBrowserClient() as any;
  let categoryId = input.destination_category_id;
  if (categoryId === undefined && input.destination_type === "category" && input.destination_id) {
    if (input.destination_id.length === 36 && input.destination_id.includes("-")) {
      categoryId = input.destination_id;
    } else {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", input.destination_id).maybeSingle();
      if (cat) categoryId = cat.id;
    }
  }

  const updateData: any = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  if (categoryId !== undefined) {
    updateData.destination_category_id = categoryId;
  }

  const { data, error } = await supabase
    .from("hero_slides")
    .update(updateData)
    .eq("id", id)
    .select("*, categories:destination_category_id(*)")
    .single();

  if (error) throw new Error(error.message);
  return normalizeHeroSlide(data);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderHeroSlides(orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("hero_slides").update({ display_order: i }).eq("id", orderedIds[i]);
  }
}

// ============================================================
// HOMEPAGE CATEGORIES — READ & WRITE
// ============================================================

function normalizeHomepageCategory(row: any): HomepageCategory {
  let computedLink = row.link_url || "/products";

  if (row.destination_type === "category") {
    if (row.categories && row.categories.slug) {
      computedLink = row.categories.is_active !== false
        ? (row.categories.slug === "all" ? "/products" : `/products?category=${encodeURIComponent(row.categories.slug)}`)
        : "/products";
    } else if (row.category_slug) {
      computedLink = `/products?category=${encodeURIComponent(row.category_slug)}`;
    }
  }

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image_url: row.image_url,
    link_url: computedLink,
    category_slug: row.categories?.slug || row.category_slug,
    category_id: row.category_id || (row.categories?.id ?? null),
    destination_type: row.destination_type || "category",
    destination_id: row.destination_id || null,
    product_id: row.product_id || null,
    blob_color: row.blob_color || "#F2D5C0",
    blob_color2: row.blob_color2 || "#EEC4A8",
    display_order: row.display_order ?? 0,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listHomepageCategories(onlyActive = true): Promise<HomepageCategory[]> {
  const supabase = getSupabaseBrowserClient() as any;
  let query = supabase
    .from("homepage_categories")
    .select("*, categories:category_id(*)")
    .order("display_order", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing homepage categories:", error);
    return [];
  }
  return (data ?? []).map(normalizeHomepageCategory);
}

export async function createHomepageCategory(input: HomepageCategoryInput): Promise<HomepageCategory> {
  const supabase = getSupabaseBrowserClient() as any;
  let categoryId = input.category_id || null;
  let categorySlug = input.category_slug || null;

  if (!categoryId && input.destination_type === "category" && input.destination_id) {
    if (input.destination_id.length === 36 && input.destination_id.includes("-")) {
      categoryId = input.destination_id;
      const { data: cat } = await supabase.from("categories").select("slug").eq("id", categoryId).maybeSingle();
      if (cat) categorySlug = cat.slug;
    } else {
      categorySlug = input.destination_id;
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
      if (cat) categoryId = cat.id;
    }
  }

  const { data, error } = await supabase
    .from("homepage_categories")
    .insert({
      title: input.title,
      subtitle: input.subtitle || null,
      image_url: input.image_url,
      link_url: input.link_url || "/products",
      category_slug: categorySlug,
      category_id: categoryId,
      destination_type: input.destination_type || "category",
      destination_id: input.destination_id || null,
      product_id: input.product_id || null,
      blob_color: input.blob_color || "#F2D5C0",
      blob_color2: input.blob_color2 || "#EEC4A8",
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select("*, categories:category_id(*)")
    .single();

  if (error) throw new Error(error.message);
  return normalizeHomepageCategory(data);
}

export async function updateHomepageCategory(id: string, input: Partial<HomepageCategoryInput>): Promise<HomepageCategory> {
  const supabase = getSupabaseBrowserClient() as any;
  let categoryId = input.category_id;
  let categorySlug = input.category_slug;

  if (categoryId === undefined && input.destination_type === "category" && input.destination_id) {
    if (input.destination_id.length === 36 && input.destination_id.includes("-")) {
      categoryId = input.destination_id;
      const { data: cat } = await supabase.from("categories").select("slug").eq("id", categoryId).maybeSingle();
      if (cat) categorySlug = cat.slug;
    } else {
      categorySlug = input.destination_id;
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
      if (cat) categoryId = cat.id;
    }
  }

  const updateData: any = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  if (categoryId !== undefined) updateData.category_id = categoryId;
  if (categorySlug !== undefined) updateData.category_slug = categorySlug;

  const { data, error } = await supabase
    .from("homepage_categories")
    .update(updateData)
    .eq("id", id)
    .select("*, categories:category_id(*)")
    .single();

  if (error) throw new Error(error.message);
  return normalizeHomepageCategory(data);
}

export async function deleteHomepageCategory(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase.from("homepage_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderHomepageCategories(orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("homepage_categories").update({ display_order: i }).eq("id", orderedIds[i]);
  }
}

// ============================================================
// COMBOS & COMBO ITEMS — READ & WRITE
// ============================================================

export async function listCombos(onlyActive = true): Promise<ComboWithProducts[]> {
  const supabase = getSupabaseBrowserClient() as any;
  let query = supabase
    .from("combos")
    .select(`
      *,
      combo_items (
        id,
        combo_id,
        product_id,
        quantity,
        display_order,
        created_at,
        products (*)
      )
    `)
    .order("display_order", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing combos:", error);
    return [];
  }

  return (data ?? []).map((c: any) => {
    const rawItems = c.combo_items ?? [];
    rawItems.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const items: ComboItemWithProduct[] = rawItems
      .filter((item: any) => item.products)
      .map((item: any) => ({
        id: item.id,
        combo_id: item.combo_id,
        product_id: item.product_id,
        quantity: item.quantity ?? 1,
        display_order: item.display_order ?? 0,
        created_at: item.created_at,
        product: normalizeProduct(item.products),
      }));

    const isAvailable =
      c.is_active &&
      items.length > 0 &&
      items.every((it) => it.product && it.product.is_active && it.product.stock >= it.quantity);

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image_url,
      price: Number(c.price),
      compare_price: c.compare_price ? Number(c.compare_price) : null,
      badge: c.badge,
      display_order: c.display_order ?? 0,
      is_active: c.is_active,
      created_at: c.created_at,
      updated_at: c.updated_at,
      items,
      isAvailable,
    };
  });
}

export async function getComboById(id: string): Promise<ComboWithProducts | null> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("combos")
    .select(`
      *,
      combo_items (
        id,
        combo_id,
        product_id,
        quantity,
        display_order,
        created_at,
        products (*)
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const rawItems = data.combo_items ?? [];
  rawItems.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const items: ComboItemWithProduct[] = rawItems
    .filter((item: any) => item.products)
    .map((item: any) => ({
      id: item.id,
      combo_id: item.combo_id,
      product_id: item.product_id,
      quantity: item.quantity ?? 1,
      display_order: item.display_order ?? 0,
      created_at: item.created_at,
      product: normalizeProduct(item.products),
    }));

  const isAvailable =
    data.is_active &&
    items.length > 0 &&
    items.every((it) => it.product && it.product.is_active && it.product.stock >= it.quantity);

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    image_url: data.image_url,
    price: Number(data.price),
    compare_price: data.compare_price ? Number(data.compare_price) : null,
    badge: data.badge,
    display_order: data.display_order ?? 0,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
    items,
    isAvailable,
  };
}

/**
 * Efficiently batch-fetches full combo details (with ordered combo items and joined product details)
 * for a list of candidate IDs. Returns a Map keyed by combo ID.
 * Safely handles missing, deactivated, or deleted products.
 */
export async function getCombosByIds(comboIds: string[]): Promise<Map<string, ComboWithProducts>> {
  if (!comboIds || comboIds.length === 0) return new Map();
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("combos")
    .select(`
      *,
      combo_items (
        id,
        combo_id,
        product_id,
        quantity,
        display_order,
        created_at,
        products (*)
      )
    `)
    .in("id", comboIds);

  if (error) {
    console.error("Error fetching combos by IDs:", error);
    return new Map();
  }

  const map = new Map<string, ComboWithProducts>();
  (data ?? []).forEach((c: any) => {
    const rawItems = c.combo_items ?? [];
    rawItems.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const items: ComboItemWithProduct[] = rawItems.map((item: any) => ({
      id: item.id,
      combo_id: item.combo_id,
      product_id: item.product_id,
      quantity: item.quantity ?? 1,
      display_order: item.display_order ?? 0,
      created_at: item.created_at,
      product: item.products ? normalizeProduct(item.products) : null,
    }));

    const isAvailable =
      c.is_active &&
      items.length > 0 &&
      items.every((it) => it.product && it.product.is_active && it.product.stock >= it.quantity);

    map.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image_url,
      price: Number(c.price),
      compare_price: c.compare_price ? Number(c.compare_price) : null,
      badge: c.badge,
      display_order: c.display_order ?? 0,
      is_active: c.is_active,
      created_at: c.created_at,
      updated_at: c.updated_at,
      items,
      isAvailable,
    });
  });

  return map;
}

export async function createCombo(input: ComboInput): Promise<ComboWithProducts> {
  const supabase = getSupabaseBrowserClient() as any;
  const slug = input.slug?.trim() || generateSlug(input.name);

  // 1. Insert combo row
  const { data: comboData, error: comboErr } = await supabase
    .from("combos")
    .insert({
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      image_url: input.image_url,
      price: input.price,
      compare_price: input.compare_price || null,
      badge: input.badge?.trim() || "Combo Pack",
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select("*")
    .single();

  if (comboErr) throw new Error(comboErr.message);

  // 2. Insert combo_items
  if (input.product_ids && input.product_ids.length > 0) {
    const itemsPayload = input.product_ids.map((item, index) => ({
      combo_id: comboData.id,
      product_id: item.product_id,
      quantity: item.quantity ?? 1,
      display_order: index,
    }));

    const { error: itemsErr } = await supabase.from("combo_items").insert(itemsPayload);
    if (itemsErr) {
      console.error("Error inserting combo items:", itemsErr);
    }
  }

  // 3. Keep products table synchronized so combo appears in the Combos category
  try {
    const { data: combosCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "combos")
      .maybeSingle();

    await supabase.from("products").upsert({
      id: comboData.id,
      name: comboData.name,
      slug: comboData.slug,
      category: "combos",
      category_id: combosCat?.id || null,
      price: comboData.price,
      compare_price: comboData.compare_price || null,
      description: comboData.description,
      images: [comboData.image_url],
      stock: 50,
      is_active: comboData.is_active,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Failed to sync combo into products table:", err);
  }

  const result = await getComboById(comboData.id);
  if (!result) throw new Error("Failed to retrieve created combo");
  return result;
}

export async function updateCombo(id: string, input: Partial<ComboInput>): Promise<ComboWithProducts> {
  const supabase = getSupabaseBrowserClient() as any;

  const updateFields: any = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) updateFields.name = input.name.trim();
  if (input.slug !== undefined) updateFields.slug = input.slug.trim();
  if (input.description !== undefined) updateFields.description = input.description?.trim() || null;
  if (input.image_url !== undefined) updateFields.image_url = input.image_url;
  if (input.price !== undefined) updateFields.price = input.price;
  if (input.compare_price !== undefined) updateFields.compare_price = input.compare_price || null;
  if (input.badge !== undefined) updateFields.badge = input.badge?.trim() || null;
  if (input.display_order !== undefined) updateFields.display_order = input.display_order;
  if (input.is_active !== undefined) updateFields.is_active = input.is_active;

  const { error: comboErr } = await supabase
    .from("combos")
    .update(updateFields)
    .eq("id", id);

  if (comboErr) throw new Error(comboErr.message);

  // If product_ids were provided, replace combo_items
  if (input.product_ids !== undefined) {
    await supabase.from("combo_items").delete().eq("combo_id", id);

    if (input.product_ids.length > 0) {
      const itemsPayload = input.product_ids.map((item, index) => ({
        combo_id: id,
        product_id: item.product_id,
        quantity: item.quantity ?? 1,
        display_order: index,
      }));
      await supabase.from("combo_items").insert(itemsPayload);
    }
  }

  // Keep products table synchronized
  try {
    const { data: combosCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "combos")
      .maybeSingle();

    const prodUpdate: any = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) prodUpdate.name = input.name.trim();
    if (input.slug !== undefined) prodUpdate.slug = input.slug.trim();
    if (input.description !== undefined) prodUpdate.description = input.description?.trim() || null;
    if (input.image_url !== undefined) prodUpdate.images = [input.image_url];
    if (input.price !== undefined) prodUpdate.price = input.price;
    if (input.compare_price !== undefined) prodUpdate.compare_price = input.compare_price || null;
    if (input.is_active !== undefined) prodUpdate.is_active = input.is_active;
    prodUpdate.category = "combos";
    if (combosCat?.id) prodUpdate.category_id = combosCat.id;

    await supabase.from("products").update(prodUpdate).eq("id", id);
  } catch (err) {
    console.warn("Failed to sync updated combo into products table:", err);
  }

  const result = await getComboById(id);
  if (!result) throw new Error("Failed to retrieve updated combo");
  return result;
}

export async function deleteCombo(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase.from("combos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  try {
    await supabase.from("products").delete().eq("id", id);
  } catch (err) {
    console.warn("Failed to delete synced combo from products table:", err);
  }
}

export async function reorderCombos(orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("combos").update({ display_order: i }).eq("id", orderedIds[i]);
  }
}

// ============================================================
// PRODUCT REVIEWS & RATINGS — DATA LAYER
// ============================================================

/**
 * Normalizes a product_reviews row from Supabase into our ProductReview type
 */
function normalizeProductReview(row: any): ProductReview {
  return {
    id: row.id,
    product_id: row.product_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email ?? null,
    customer_phone: row.customer_phone ?? null,
    rating: Number(row.rating),
    title: row.title,
    comment: row.comment,
    status: row.status as ReviewStatus,
    verified_purchase: Boolean(row.verified_purchase),
    admin_notes: row.admin_notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetches approved reviews for a specific product with sorting and pagination
 */
export async function listProductReviews(
  productId: string,
  options?: {
    sort?: "recent" | "highest" | "lowest";
    limit?: number;
    offset?: number;
  }
): Promise<{ reviews: ProductReview[]; total: number }> {
  const supabase = getSupabaseBrowserClient() as any;
  const sort = options?.sort || "recent";
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("product_reviews")
    .select("*", { count: "exact" })
    .eq("product_id", productId)
    .eq("status", "approved");

  if (sort === "highest") {
    query = query
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (sort === "lowest") {
    query = query
      .order("rating", { ascending: true })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (limit) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("listProductReviews error:", error);
    return { reviews: [], total: 0 };
  }

  return {
    reviews: (data ?? []).map(normalizeProductReview),
    total: count ?? data?.length ?? 0,
  };
}

/**
 * Returns overall rating and star distribution for a single product.
 * Uses the database RPC function for optimal performance with client-side fallback.
 */
export async function getProductReviewSummary(
  productId: string
): Promise<ProductReviewSummary> {
  const supabase = getSupabaseBrowserClient() as any;

  try {
    const { data, error } = await supabase.rpc("get_product_review_summary", {
      p_product_id: productId,
    });
    if (!error && data) {
      return {
        product_id: data.product_id || productId,
        total_reviews: Number(data.total_reviews || 0),
        average_rating: Number(data.average_rating || 0),
        five_star: Number(data.five_star || 0),
        four_star: Number(data.four_star || 0),
        three_star: Number(data.three_star || 0),
        two_star: Number(data.two_star || 0),
        one_star: Number(data.one_star || 0),
      };
    }
  } catch (err) {
    console.warn("RPC get_product_review_summary error, using fallback query:", err);
  }

  // Fallback query if RPC unavailable
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");

  if (error || !data || data.length === 0) {
    return {
      product_id: productId,
      total_reviews: 0,
      average_rating: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0,
    };
  }

  const total = data.length;
  const sum = data.reduce((acc: number, r: { rating: number }) => acc + Number(r.rating), 0);
  const avg = Math.round((sum / total) * 10) / 10;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach((r: { rating: number }) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[star] = (counts[star] || 0) + 1;
  });

  return {
    product_id: productId,
    total_reviews: total,
    average_rating: avg,
    five_star: counts[5],
    four_star: counts[4],
    three_star: counts[3],
    two_star: counts[2],
    one_star: counts[1],
  };
}

/**
 * Returns snapshot rating data (average rating + review count) for all products with approved reviews.
 * Batch-queried to avoid N+1 queries across catalog and collection cards.
 */
export async function getAllProductRatings(): Promise<Record<string, ProductRatingSnapshot>> {
  const supabase = getSupabaseBrowserClient() as any;

  try {
    const { data, error } = await supabase.rpc("get_all_product_ratings");
    if (!error && Array.isArray(data)) {
      const map: Record<string, ProductRatingSnapshot> = {};
      data.forEach((row: any) => {
        map[row.product_id] = {
          product_id: row.product_id,
          total_reviews: Number(row.total_reviews),
          average_rating: Number(row.average_rating),
        };
      });
      return map;
    }
  } catch (err) {
    console.warn("RPC get_all_product_ratings error, using fallback query:", err);
  }

  // Fallback client-side aggregation
  const { data } = await supabase
    .from("product_reviews")
    .select("product_id, rating")
    .eq("status", "approved");

  const map: Record<string, ProductRatingSnapshot> = {};
  if (!data || !Array.isArray(data)) return map;

  const grouped: Record<string, number[]> = {};
  data.forEach((r: any) => {
    if (!grouped[r.product_id]) grouped[r.product_id] = [];
    grouped[r.product_id].push(Number(r.rating));
  });

  for (const [prodId, ratings] of Object.entries(grouped)) {
    const total = ratings.length;
    const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / total) * 10) / 10;
    map[prodId] = {
      product_id: prodId,
      total_reviews: total,
      average_rating: avg,
    };
  }
  return map;
}

/**
 * Validates whether a customer has genuinely purchased a specific product in prior orders.
 * Checks customer email or phone against database orders containing this product.
 */
export async function checkCustomerVerifiedPurchase(
  productId: string,
  emailOrPhone: string
): Promise<boolean> {
  if (!emailOrPhone || !emailOrPhone.trim()) return false;
  const clean = emailOrPhone.trim();
  const supabase = getSupabaseBrowserClient() as any;

  try {
    const isEmail = clean.includes("@");
    let query = supabase
      .from("orders")
      .select("items, payment_status, order_status");

    if (isEmail) {
      query = query.ilike("customer_email", clean.toLowerCase());
    } else {
      const digitsOnly = clean.replace(/\D/g, "");
      query = query.or(`customer_phone.ilike.%${digitsOnly}%,customer_phone.eq.${clean}`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return false;

    for (const order of data) {
      const items = Array.isArray(order.items) ? order.items : [];
      const hasProduct = items.some(
        (item: any) =>
          item.product_id === productId ||
          item.id === productId ||
          item.slug === productId
      );
      if (hasProduct) {
        return true;
      }
    }
  } catch (err) {
    console.warn("checkCustomerVerifiedPurchase check error:", err);
  }

  return false;
}

/**
 * Submits a customer review. By default sets status="pending" for admin moderation.
 * Verifies purchase automatically if contact information matches an existing order.
 */
export async function createCustomerReview(input: ReviewInput): Promise<ProductReview> {
  if (!input.product_id) throw new Error("Product ID is required.");
  if (!input.customer_name || !input.customer_name.trim()) throw new Error("Customer name is required.");
  if (!input.rating || input.rating < 1 || input.rating > 5) throw new Error("Rating must be between 1 and 5.");
  if (!input.title || !input.title.trim()) throw new Error("Review title is required.");
  if (!input.comment || !input.comment.trim()) throw new Error("Review comment is required.");

  let isVerified = false;
  const contact = input.customer_email || input.customer_phone;
  if (contact) {
    isVerified = await checkCustomerVerifiedPurchase(input.product_id, contact);
  }

  const supabase = getSupabaseBrowserClient() as any;
  const payload = {
    product_id: input.product_id,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email?.trim() || null,
    customer_phone: input.customer_phone?.trim() || null,
    rating: Math.round(input.rating),
    title: input.title.trim(),
    comment: input.comment.trim(),
    status: "pending", // Customer reviews undergo admin moderation
    verified_purchase: isVerified,
  };

  const { data, error } = await supabase
    .from("product_reviews")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProductReview(data);
}

// ── ADMIN REVIEW MANAGEMENT FUNCTIONS ──────────────────────────

export interface AdminReviewFilters {
  productId?: string;
  status?: ReviewStatus | "all";
  rating?: number | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fetches all reviews across all products for Admin management, including product metadata
 */
export async function listAllReviewsForAdmin(
  filters?: AdminReviewFilters
): Promise<{ reviews: ProductReviewWithProduct[]; total: number }> {
  const supabase = getSupabaseBrowserClient() as any;
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, filters?.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("product_reviews")
    .select(
      `
      *,
      products:product_id (
        id,
        name,
        slug,
        category,
        images,
        price
      )
    `,
      { count: "exact" }
    );

  if (filters?.productId && filters.productId !== "all") {
    query = query.eq("product_id", filters.productId);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.rating && filters.rating !== "all") {
    query = query.eq("rating", Number(filters.rating));
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `customer_name.ilike.%${q}%,title.ilike.%${q}%,comment.ilike.%${q}%`
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const reviews: ProductReviewWithProduct[] = (data ?? []).map((row: any) => ({
    ...normalizeProductReview(row),
    product: row.products || null,
  }));

  return {
    reviews,
    total: count ?? reviews.length,
  };
}

/**
 * Admin creates a new review directly (can set status and verified_purchase flag)
 */
export async function createAdminReview(input: ReviewInput): Promise<ProductReview> {
  if (!input.product_id) throw new Error("Product ID is required.");
  if (!input.customer_name?.trim()) throw new Error("Reviewer name is required.");
  if (!input.title?.trim()) throw new Error("Review title is required.");
  if (!input.comment?.trim()) throw new Error("Review comment is required.");
  if (input.rating < 1 || input.rating > 5) throw new Error("Rating must be between 1 and 5.");

  const supabase = getSupabaseBrowserClient() as any;
  const payload = {
    product_id: input.product_id,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email?.trim() || null,
    customer_phone: input.customer_phone?.trim() || null,
    rating: Math.round(input.rating),
    title: input.title.trim(),
    comment: input.comment.trim(),
    status: input.status || "approved",
    verified_purchase: Boolean(input.verified_purchase),
    admin_notes: input.admin_notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from("product_reviews")
    .insert(payload)
    .select("*, products:product_id(id, name, slug, category, images, price)")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProductReview(data);
}

/**
 * Admin updates an existing review (rating, content, moderation status, re-assigning product, etc.)
 */
export async function updateAdminReview(
  id: string,
  updates: Partial<ProductReview>
): Promise<ProductReview> {
  const supabase = getSupabaseBrowserClient() as any;

  const payload: any = {};
  if (updates.product_id !== undefined) payload.product_id = updates.product_id;
  if (updates.customer_name !== undefined) payload.customer_name = updates.customer_name.trim();
  if (updates.customer_email !== undefined) payload.customer_email = updates.customer_email?.trim() || null;
  if (updates.customer_phone !== undefined) payload.customer_phone = updates.customer_phone?.trim() || null;
  if (updates.rating !== undefined) payload.rating = Math.max(1, Math.min(5, Math.round(updates.rating)));
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.comment !== undefined) payload.comment = updates.comment.trim();
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.verified_purchase !== undefined) payload.verified_purchase = Boolean(updates.verified_purchase);
  if (updates.admin_notes !== undefined) payload.admin_notes = updates.admin_notes?.trim() || null;

  const { data, error } = await supabase
    .from("product_reviews")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProductReview(data);
}

/**
 * Admin deletes a review permanently
 */
export async function deleteAdminReview(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase.from("product_reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Realtime subscription for reviews of a specific product
 */
export function subscribeToProductReviews(
  productId: string,
  onChange: () => void
): () => void {
  const supabase = getSupabaseBrowserClient();
  const channel = supabase
    .channel(`product-reviews-${productId}-${Date.now()}`)
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "product_reviews",
        filter: `product_id=eq.${productId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================
// CUSTOMER TRANSFORMATIONS
// ============================================================

function normalizeCustomerTransformation(row: any): CustomerTransformation {
  return {
    id: row.id,
    customer: row.customer || "",
    location: row.location || null,
    duration: row.duration || "6 weeks",
    product: row.product || "",
    product_href: row.product_href || "/products",
    product1_label: row.product1_label || "View Product",
    product_href2: row.product_href2 || null,
    product2_label: row.product2_label || null,
    concerns: Array.isArray(row.concerns) ? row.concerns : [],
    result: row.result || "",
    before_src: row.before_src || null,
    after_src: row.after_src || null,
    accent_color: row.accent_color || "#7A2040",
    tag_label: row.tag_label || "Transformation",
    display_order: row.display_order ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export async function listTransformations(onlyActive = true): Promise<CustomerTransformation[]> {
  const supabase = getSupabaseBrowserClient() as any;
  let query = supabase
    .from("customer_transformations")
    .select("*")
    .order("display_order", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing customer transformations:", error);
    return [];
  }
  return (data ?? []).map(normalizeCustomerTransformation);
}

export async function createTransformation(input: CustomerTransformationInput): Promise<CustomerTransformation> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("customer_transformations")
    .insert({
      customer: input.customer,
      location: input.location || null,
      duration: input.duration || "6 weeks",
      product: input.product,
      product_href: input.product_href || "/products",
      product1_label: input.product1_label,
      product_href2: input.product_href2 || null,
      product2_label: input.product2_label || null,
      concerns: input.concerns || [],
      result: input.result,
      before_src: input.before_src || null,
      after_src: input.after_src || null,
      accent_color: input.accent_color || "#7A2040",
      tag_label: input.tag_label || "Transformation",
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeCustomerTransformation(data);
}

export async function updateTransformation(id: string, input: Partial<CustomerTransformationInput>): Promise<CustomerTransformation> {
  const supabase = getSupabaseBrowserClient() as any;
  const payload: any = { ...input };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;

  const { data, error } = await supabase
    .from("customer_transformations")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeCustomerTransformation(data);
}

export async function deleteTransformation(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase.from("customer_transformations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderTransformations(ids: string[]): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const updates = ids.map((id, index) =>
    supabase.from("customer_transformations").update({ display_order: index }).eq("id", id)
  );
  await Promise.all(updates);
}

// ============================================================
// HOMEPAGE TESTIMONIALS
// ============================================================

function normalizeHomepageTestimonial(row: any): HomepageTestimonial {
  return {
    id: row.id,
    name: row.name || "",
    location: row.location || null,
    rating: row.rating ?? 5,
    avatar: row.avatar || null,
    quote: row.quote || "",
    products: Array.isArray(row.products) ? row.products : [],
    display_order: row.display_order ?? 0,
    is_active: row.is_active ?? true,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export async function listHomepageTestimonials(onlyActive = true): Promise<HomepageTestimonial[]> {
  const supabase = getSupabaseBrowserClient() as any;
  let query = supabase
    .from("homepage_testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing homepage testimonials:", error);
    return [];
  }
  return (data ?? []).map(normalizeHomepageTestimonial);
}

export async function createHomepageTestimonial(input: HomepageTestimonialInput): Promise<HomepageTestimonial> {
  const supabase = getSupabaseBrowserClient() as any;
  const { data, error } = await supabase
    .from("homepage_testimonials")
    .insert({
      name: input.name,
      location: input.location || null,
      rating: input.rating ?? 5,
      avatar: input.avatar || null,
      quote: input.quote,
      products: input.products || [],
      display_order: input.display_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeHomepageTestimonial(data);
}

export async function updateHomepageTestimonial(id: string, input: Partial<HomepageTestimonialInput>): Promise<HomepageTestimonial> {
  const supabase = getSupabaseBrowserClient() as any;
  const payload: any = { ...input };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;

  const { data, error } = await supabase
    .from("homepage_testimonials")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeHomepageTestimonial(data);
}

export async function deleteHomepageTestimonial(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const { error } = await supabase.from("homepage_testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderHomepageTestimonials(ids: string[]): Promise<void> {
  const supabase = getSupabaseBrowserClient() as any;
  const updates = ids.map((id, index) =>
    supabase.from("homepage_testimonials").update({ display_order: index }).eq("id", id)
  );
  await Promise.all(updates);
}

