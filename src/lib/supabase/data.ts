import { generateOrderNumber, generateSlug } from "@/lib/utils";
import type { CartItem, CategoryFilter, Order, OrderItem, Product } from "@/lib/types";
import { getSupabaseBrowserClient } from "./client";
import type { Database, Json } from "./database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

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

const CATEGORY_FALLBACK_IMAGE: Record<Product["category"], string> = {
  "face-cream": "/images/cat-face-cream.webp",
  "face-wash": "/images/cat-face-wash.webp",
  soap: "/images/cat-soap.webp",
  "nalangu-maavu": "/images/cat-nalangu-maavu.webp",
};

const DISALLOWED_PLACEHOLDER_HOSTS = new Set([
  "via.placeholder.com",
  "placehold.co",
  "placehold.it",
]);

function normalizeProductImages(images: string[] | null | undefined, category: Product["category"]) {
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

  return [CATEGORY_FALLBACK_IMAGE[category]];
}

function normalizeProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    variant_name: row.variant_name,
    price: row.price,
    compare_price: row.compare_price,
    description: row.description,
    ingredients: row.ingredients,
    how_to_use: row.how_to_use,
    images: normalizeProductImages(row.images, row.category),
    stock: row.stock,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeOrder(row: OrderRow): Order {
  return {
    id: row.id,
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
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const uniqueProducts: Product[] = [];
  const seenNames = new Set<string>();
  (data ?? []).forEach((row) => {
    const normalized = normalizeProduct(row);
    if (!seenNames.has(normalized.name)) {
      seenNames.add(normalized.name);
      uniqueProducts.push(normalized);
    }
  });

  return uniqueProducts;
}

export async function listFeaturedProducts(limit = 3): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) throw new Error(error.message);

  const uniqueProducts: Product[] = [];
  const seenNames = new Set<string>();
  (data ?? []).forEach((row) => {
    const normalized = normalizeProduct(row);
    if (!seenNames.has(normalized.name)) {
      seenNames.add(normalized.name);
      uniqueProducts.push(normalized);
    }
  });

  return uniqueProducts.slice(0, limit);
}

export async function getProductVariants(name: string): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeProduct);
}

/**
 * Given a list of product IDs already in the cart, returns the subset that
 * are still active in the database. Used to auto-remove deactivated items.
 * A single .in() query is used — no N+1 problem.
 */
export async function getActiveProductIds(productIds: string[]): Promise<Set<string>> {
  if (productIds.length === 0) return new Set();
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .in("id", productIds)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.id));
}



// ============================================================
// PRODUCTS — WRITE
// ============================================================

interface CreateProductInput {
  name: string;
  category: Product["category"];
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
  const supabase = getSupabaseBrowserClient();
  const payload: ProductInsert = {
    name: input.name,
    slug: generateSlug(input.name, input.variant_name ?? undefined),
    category: input.category,
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
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

interface UpdateProductInput extends Partial<CreateProductInput> {}

export async function updateProduct(productId: string, input: UpdateProductInput): Promise<Product> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("products")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

export async function updateProductActive(productId: string, isActive: boolean): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
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
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);
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
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  // The DB trigger `trg_sync_customer_on_order` auto-upserts the customer row
  return normalizeOrder(data);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeOrder);
}

export async function updateOrderStatus(orderId: string, status: Order["order_status"]): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function updateOrderPaymentStatus(
  orderId: string,
  status: Order["payment_status"]
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function updateOrderNotes(orderId: string, notes: string | null): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("orders")
    .update({ notes })
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
