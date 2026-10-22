/**
 * GET  /api/products/[productId]/reviews — fetch approved reviews + rating breakdown for a product
 * POST /api/products/[productId]/reviews — submit customer review (defaults to pending moderation)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveProductId(supabase: any, idOrSlug: string): Promise<string | null> {
  if (UUID_REGEX.test(idOrSlug)) {
    return idOrSlug;
  }
  // Try finding by slug
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("slug", idOrSlug)
    .maybeSingle();

  return data?.id || null;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { productId: rawId } = await params;
    const supabase = getSupabaseServiceClient();

    const productId = await resolveProductId(supabase, rawId);
    if (!productId) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "recent";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(50, parseInt(searchParams.get("pageSize") || "10", 10)));
    const offset = (page - 1) * pageSize;

    // Fetch summary via RPC
    let summary: any = null;
    try {
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc(
        "get_product_review_summary",
        { p_product_id: productId }
      );
      if (!rpcError && rpcData) {
        summary = rpcData;
      }
    } catch {
      // ignore, fallback below
    }

    // Query approved reviews
    let query = (supabase as any)
      .from("product_reviews")
      .select("id, product_id, customer_name, rating, title, comment, verified_purchase, created_at", {
        count: "exact",
      })
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

    query = query.range(offset, offset + pageSize - 1);

    const { data: reviews, count, error } = await query;
    if (error) {
      console.error("[products/[productId]/reviews GET error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fallback summary calculation if RPC was null
    if (!summary) {
      const { data: allApproved } = await (supabase as any)
        .from("product_reviews")
        .select("rating")
        .eq("product_id", productId)
        .eq("status", "approved");

      const total = allApproved?.length || 0;
      const sum = (allApproved || []).reduce((acc: number, r: any) => acc + Number(r.rating), 0);
      const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      (allApproved || []).forEach((r: any) => {
        const s = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        counts[s] = (counts[s] || 0) + 1;
      });

      summary = {
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

    return NextResponse.json({
      reviews: reviews ?? [],
      total: count ?? (reviews?.length || 0),
      summary,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[products/[productId]/reviews GET]", err);
    return NextResponse.json({ error: "Failed to load product reviews." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { productId: rawId } = await params;
    const supabase = getSupabaseServiceClient();

    const productId = await resolveProductId(supabase, rawId);
    if (!productId) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { customer_name, customer_email, customer_phone, rating, title, comment } = body;

    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Review title is required." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Review content is required." }, { status: 400 });
    }

    // Check verified purchase against orders if contact is provided
    let isVerified = false;
    const contact = (customer_email || customer_phone || "").trim();
    if (contact) {
      try {
        const isEmail = contact.includes("@");
        let orderQuery = (supabase as any)
          .from("orders")
          .select("items, payment_status, order_status");

        if (isEmail) {
          orderQuery = orderQuery.ilike("customer_email", contact.toLowerCase());
        } else {
          const digitsOnly = contact.replace(/\D/g, "");
          orderQuery = orderQuery.or(`customer_phone.ilike.%${digitsOnly}%,customer_phone.eq.${contact}`);
        }

        const { data: orders } = await orderQuery;
        if (orders && orders.length > 0) {
          for (const ord of orders) {
            const items = Array.isArray(ord.items) ? ord.items : [];
            const hasProduct = items.some(
              (item: any) =>
                item.product_id === productId ||
                item.id === productId ||
                item.slug === rawId
            );
            if (hasProduct) {
              isVerified = true;
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Verified purchase check failed:", err);
      }
    }

    // Customer submissions ALWAYS go into pending status for moderation
    const payload = {
      product_id: productId,
      customer_name: customer_name.trim().slice(0, 100),
      customer_email: customer_email?.trim().slice(0, 150) || null,
      customer_phone: customer_phone?.trim().slice(0, 30) || null,
      rating: Math.round(numRating),
      title: title.trim().slice(0, 200),
      comment: comment.trim().slice(0, 2000),
      status: "pending", // strictly pending
      verified_purchase: isVerified,
    };

    const { data, error } = await (supabase as any)
      .from("product_reviews")
      .insert(payload)
      .select("id, product_id, customer_name, rating, title, comment, verified_purchase, created_at, status")
      .single();

    if (error) {
      console.error("[products/[productId]/reviews POST error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Thank you! Your review has been submitted and will appear once verified.",
        review: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[products/[productId]/reviews POST]", err);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
