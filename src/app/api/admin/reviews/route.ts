/**
 * GET  /api/admin/reviews — list and filter reviews across all products
 * POST /api/admin/reviews — create a new review for a product from admin
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("productId");
    const status = searchParams.get("status");
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "20", 10)));
    const offset = (page - 1) * pageSize;

    let query = (supabase as any)
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

    if (productId && productId !== "all") {
      query = query.eq("product_id", productId);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (rating && rating !== "all") {
      const numRating = parseInt(rating, 10);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 5) {
        query = query.eq("rating", numRating);
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(
        `customer_name.ilike.%${q}%,title.ilike.%${q}%,comment.ilike.%${q}%`
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("[admin/reviews GET error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reviews = (data ?? []).map((row: any) => ({
      ...row,
      product: row.products || null,
    }));

    return NextResponse.json({
      reviews,
      total: count ?? reviews.length,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[admin/reviews GET]", err);
    return NextResponse.json({ error: "Unexpected error fetching reviews." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const {
      product_id,
      customer_name,
      customer_email,
      customer_phone,
      rating,
      title,
      comment,
      status,
      verified_purchase,
      admin_notes,
    } = body;

    if (!product_id || typeof product_id !== "string") {
      return NextResponse.json({ error: "Product is required." }, { status: 400 });
    }

    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json({ error: "Reviewer name is required." }, { status: 400 });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5." }, { status: 400 });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Review title is required." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json({ error: "Review comment is required." }, { status: 400 });
    }

    const validStatuses = ["pending", "approved", "rejected", "hidden"];
    const reviewStatus = validStatuses.includes(status) ? status : "approved";

    const supabase = getSupabaseServiceClient();

    // Verify product exists
    const { data: productCheck, error: prodErr } = await (supabase as any)
      .from("products")
      .select("id, name")
      .eq("id", product_id)
      .maybeSingle();

    if (prodErr || !productCheck) {
      return NextResponse.json({ error: "Referenced product does not exist." }, { status: 400 });
    }

    const payload = {
      product_id,
      customer_name: customer_name.trim(),
      customer_email: customer_email?.trim() || null,
      customer_phone: customer_phone?.trim() || null,
      rating: Math.round(parsedRating),
      title: title.trim(),
      comment: comment.trim(),
      status: reviewStatus,
      verified_purchase: Boolean(verified_purchase),
      admin_notes: admin_notes?.trim() || null,
    };

    const { data, error } = await (supabase as any)
      .from("product_reviews")
      .insert(payload)
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
      `
      )
      .single();

    if (error) {
      console.error("[admin/reviews POST error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        review: {
          ...data,
          product: data.products || null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[admin/reviews POST]", err);
    return NextResponse.json({ error: "Unexpected error creating review." }, { status: 500 });
  }
}
