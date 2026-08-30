export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: "face-cream" | "face-wash" | "soap" | "nalangu-maavu" | "oil" | "balm";
          variant_name: string | null;
          price: number;
          compare_price: number | null;
          description: string | null;
          ingredients: string | null;
          how_to_use: string | null;
          images: string[];
          /** @deprecated Use product_images table instead. */
          image_path: string | null;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: "face-cream" | "face-wash" | "soap" | "nalangu-maavu" | "oil" | "balm";
          variant_name?: string | null;
          price: number;
          compare_price?: number | null;
          description?: string | null;
          ingredients?: string | null;
          how_to_use?: string | null;
          images?: string[];
          /** @deprecated Use product_images table instead. */
          image_path?: string | null;
          stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          image_path: string;
          display_order: number;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          image_path: string;
          display_order?: number;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
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
          items: Json;
          subtotal: number;
          shipping_charge: number;
          total: number;
          payment_status: "pending" | "paid" | "failed";
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          order_status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
          notes: string | null;
          promo_code_snapshot: string | null;
          discount_type_snapshot: string | null;
          discount_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          items: Json;
          subtotal: number;
          shipping_charge?: number;
          total: number;
          payment_status?: "pending" | "paid" | "failed";
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          order_status?: "new" | "processing" | "shipped" | "delivered" | "cancelled";
          notes?: string | null;
          promo_code_snapshot?: string | null;
          discount_type_snapshot?: string | null;
          discount_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          email: string | null;
          order_count: number;
          total_spent: number;
          first_seen_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          name?: string | null;
          email?: string | null;
          order_count?: number;
          total_spent?: number;
          first_seen_at?: string;
          last_seen_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_categories"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: Json | null;
          cover_image_url: string | null;
          category_id: string | null;
          status: "draft" | "published";
          author_name: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: Json | null;
          cover_image_url?: string | null;
          category_id?: string | null;
          status?: "draft" | "published";
          author_name?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_type: "percentage" | "flat";
          discount_value: number;
          max_discount_cap: number | null;
          min_order_value: number | null;
          usage_limit_total: number | null;
          usage_limit_per_user: number | null;
          times_used: number;
          applies_to: "all" | "category" | "product";
          applies_to_id: string | null;
          starts_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          show_in_banner: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: "percentage" | "flat";
          discount_value: number;
          max_discount_cap?: number | null;
          min_order_value?: number | null;
          usage_limit_total?: number | null;
          usage_limit_per_user?: number | null;
          times_used?: number;
          applies_to?: "all" | "category" | "product";
          applies_to_id?: string | null;
          starts_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          show_in_banner?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Insert"]>;
        Relationships: [];
      };
      promo_code_redemptions: {
        Row: {
          id: string;
          promo_code_id: string | null;
          user_id: string | null;
          order_id: string | null;
          discount_applied: number;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          promo_code_id?: string | null;
          user_id?: string | null;
          order_id?: string | null;
          discount_applied: number;
          redeemed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["promo_code_redemptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      promo_banner_view: {
        Row: {
          code: string;
          description: string | null;
          discount_type: "percentage" | "flat";
          discount_value: number;
          max_discount_cap: number | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ── Promo code table types (separate for convenience) ──────────
export interface PromoCodeRow {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  max_discount_cap: number | null;
  min_order_value: number | null;
  usage_limit_total: number | null;
  usage_limit_per_user: number | null;
  times_used: number;
  applies_to: "all" | "category" | "product";
  applies_to_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  show_in_banner: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}
