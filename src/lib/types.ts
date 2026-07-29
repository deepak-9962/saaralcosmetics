// ============================================
// DATABASE TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: "face-cream" | "face-wash" | "soap" | "nalangu-maavu";
  variant_name: string | null;
  price: number;
  compare_price: number | null;
  description: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  images: string[];
  /** @deprecated Use product_images query instead. Kept for backward-compat fallback. */
  image_path?: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** One row from the product_images table. display_order=0 is the main/thumbnail image. */
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_path: string;
  display_order: number;
  alt_text: string | null;
  created_at: string;
}

/** A Product with its full ordered gallery fetched from product_images. */
export interface ProductWithImages extends Product {
  product_images: ProductImage[];
}


export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  product_id: string;
  name: string;
  variant: string | null;
  qty: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping_charge: number;
  total: number;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  order_status: OrderStatus;
  notes: string | null;
  /** Promo code string at time of order (snapshot — survives code edits/deletes) */
  promo_code_snapshot: string | null;
  /** Discount type snapshot ('percentage' | 'flat') */
  discount_type_snapshot: string | null;
  /** Absolute rupee discount applied to this order */
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  product_id: string;
  name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface WishlistState {
  items: Product[];
  itemCount: number;
}

// ============================================
// UI TYPES
// ============================================

export type CategoryFilter =
  | "all"
  | "face-cream"
  | "face-wash"
  | "soap"
  | "nalangu-maavu";

export interface CategoryInfo {
  slug: CategoryFilter;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: "all", label: "All", icon: "apps" },
  { slug: "face-cream", label: "Face Cream", icon: "spa" },
  { slug: "face-wash", label: "Face Wash", icon: "water_drop" },
  { slug: "soap", label: "Soap", icon: "clean_hands" },
  { slug: "nalangu-maavu", label: "Nalangu Maavu", icon: "potted_plant" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

// ============================================
// BLOG TYPES
// ============================================

export type BlogPostStatus = "draft" | "published";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: any; // Tiptap JSON Document
  cover_image_url: string | null;
  category_id: string | null;
  status: BlogPostStatus;
  author_name: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostWithCategory extends BlogPost {
  blog_categories: BlogCategory | null;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: any;
  cover_image_url?: string | null;
  category_id?: string | null;
  status: BlogPostStatus;
  author_name?: string;
}


// ============================================
// PROMO CODE TYPES
// ============================================

export type DiscountType = 'percentage' | 'flat';
export type AppliesTo = 'all' | 'category' | 'product';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_cap: number | null;
  min_order_value: number | null;
  usage_limit_total: number | null;
  usage_limit_per_user: number | null;
  times_used: number;
  applies_to: AppliesTo;
  applies_to_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  show_in_banner: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Minimal shape returned by the banner API (safe subset) */
export interface PromoBannerCode {
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_cap: number | null;
}

/** Returned by /api/promo/validate */
export type PromoValidationResult =
  | {
      valid: true;
      code: string;
      discount_type: DiscountType;
      discount_amount: number;
      final_total: number;
    }
  | {
      valid: false;
      reason: string;
    };

/** Applied promo state stored in CartContext */
export interface AppliedPromo {
  code: string;
  discount_type: DiscountType;
  discount_amount: number;
}

