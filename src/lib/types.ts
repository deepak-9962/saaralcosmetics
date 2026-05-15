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
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
