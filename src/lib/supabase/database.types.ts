export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: "face-cream" | "face-wash" | "soap" | "nalangu-maavu";
          variant_name?: string | null;
          price: number;
          compare_price?: number | null;
          description?: string | null;
          ingredients?: string | null;
          how_to_use?: string | null;
          images?: string[];
          stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
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
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
