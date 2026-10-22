/**
 * GET    /api/admin/reviews/[id] — fetch single review
 * PATCH  /api/admin/reviews/[id] — update review (rating, content, moderation status, re-assign product)
 * DELETE /api/admin/reviews/[id] — permanently delete review
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid review ID." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { data, error } = await (supabase as any)
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
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({
      review: {
        ...data,
        product: data.products || null,
      },
    });
  } catch (err) {
    console.error("[admin/reviews/[id] GET]", err);
    return NextResponse.json({ error: "Unexpected error fetching review." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid review ID." }, { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // Verify review exists
    const { data: existing, error: findError } = await (supabase as any)
      .from("product_reviews")
      .select("id, product_id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (body.product_id !== undefined) {
      if (typeof body.product_id !== "string" || !UUID_REGEX.test(body.product_id)) {
        return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
      }
      // Check product exists
      const { data: prodCheck } = await (supabase as any)
        .from("products")
        .select("id")
        .eq("id", body.product_id)
        .maybeSingle();
      if (!prodCheck) {
        return NextResponse.json({ error: "Target product does not exist." }, { status: 400 });
      }
      updates.product_id = body.product_id;
    }

    if (body.customer_name !== undefined) {
      if (typeof body.customer_name !== "string" || !body.customer_name.trim()) {
        return NextResponse.json({ error: "Reviewer name cannot be empty." }, { status: 400 });
      }
      updates.customer_name = body.customer_name.trim();
    }

    if (body.customer_email !== undefined) {
      updates.customer_email = body.customer_email?.trim() || null;
    }

    if (body.customer_phone !== undefined) {
      updates.customer_phone = body.customer_phone?.trim() || null;
    }

    if (body.rating !== undefined) {
      const numRating = Number(body.rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json({ error: "Rating must be an integer between 1 and 5." }, { status: 400 });
      }
      updates.rating = Math.round(numRating);
    }

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json({ error: "Review title cannot be empty." }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.comment !== undefined) {
      if (typeof body.comment !== "string" || !body.comment.trim()) {
        return NextResponse.json({ error: "Review comment cannot be empty." }, { status: 400 });
      }
      updates.comment = body.comment.trim();
    }

    if (body.status !== undefined) {
      const validStatuses = ["pending", "approved", "rejected", "hidden"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.verified_purchase !== undefined) {
      updates.verified_purchase = Boolean(body.verified_purchase);
    }

    if (body.admin_notes !== undefined) {
      updates.admin_notes = body.admin_notes?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
    }

    const { data: updated, error: updateError } = await (supabase as any)
      .from("product_reviews")
      .update(updates)
      .eq("id", id)
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

    if (updateError) {
      console.error("[admin/reviews/[id] PATCH error]:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      review: {
        ...updated,
        product: updated.products || null,
      },
    });
  } catch (err) {
    console.error("[admin/reviews/[id] PATCH]", err);
    return NextResponse.json({ error: "Unexpected error updating review." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid review ID." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const { error } = await (supabase as any)
      .from("product_reviews")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[admin/reviews/[id] DELETE error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully." });
  } catch (err) {
    console.error("[admin/reviews/[id] DELETE]", err);
    return NextResponse.json({ error: "Unexpected error deleting review." }, { status: 500 });
  }
}
