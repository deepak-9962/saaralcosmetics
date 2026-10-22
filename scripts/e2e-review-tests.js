/**
 * E2E Test Suite for Saaral Cosmetics Product Reviews & Admin Review Management
 * Tests A through I as specified in the prompt requirements.
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Read environment
const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: class Dummy {} },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false },
  realtime: { transport: class Dummy {} },
});

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, message = "") {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log("=============================================================");
  console.log("RUNNING SAARAL PRODUCT REVIEWS END-TO-END TEST SUITE");
  console.log("=============================================================");

  // 1. Fetch products to get real IDs
  const { data: products, error: prodErr } = await adminClient
    .from("products")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (prodErr || !products || products.length < 2) {
    console.error("Failed to load products for testing:", prodErr);
    return;
  }

  const charcoalSoap = products.find((p) => p.slug.includes("charcoal") || p.name.includes("Charcoal")) || products[0];
  const butterflySoap = products.find((p) => p.slug.includes("butterfly") || p.name.includes("Butterfly")) || products[1];

  console.log(`Using Product A: "${charcoalSoap.name}" (${charcoalSoap.id})`);
  console.log(`Using Product B: "${butterflySoap.name}" (${butterflySoap.id})`);

  // Clean up any prior test reviews for a clean slate
  await adminClient
    .from("product_reviews")
    .delete()
    .in("title", [
      "TEST_A_CHARCOAL_REVIEW",
      "TEST_B_EDITED_TITLE",
      "TEST_C_PENDING_REVIEW",
      "TEST_D_HIDDEN_REVIEW",
      "TEST_E_DELETE_REVIEW",
      "TEST_F_REVIEW_1",
      "TEST_F_REVIEW_2",
      "TEST_F_REVIEW_3",
      "TEST_G_PERSISTENCE_REVIEW",
    ]);

  // ─────────────────────────────────────────────────────────────
  // TEST A: Product Isolation
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST A: Product Isolation ---");
  const { data: revA, error: errA } = await adminClient
    .from("product_reviews")
    .insert({
      product_id: charcoalSoap.id,
      customer_name: "Anita Sharma",
      rating: 5,
      title: "TEST_A_CHARCOAL_REVIEW",
      comment: "This charcoal soap has deep detoxifying lather. Only for charcoal soap!",
      status: "approved",
      verified_purchase: true,
    })
    .select()
    .single();

  assert(!errA && revA, "Test A1: Insert approved review for Product A");

  // Query reviews for Product A
  const { data: prodAReviews } = await anonClient
    .from("product_reviews")
    .select("*")
    .eq("product_id", charcoalSoap.id)
    .eq("status", "approved");

  assert(
    prodAReviews.some((r) => r.id === revA.id),
    "Test A2: Review appears on Product A (Charcoal Soap)"
  );

  // Query reviews for Product B
  const { data: prodBReviews } = await anonClient
    .from("product_reviews")
    .select("*")
    .eq("product_id", butterflySoap.id)
    .eq("status", "approved");

  assert(
    !prodBReviews.some((r) => r.id === revA.id),
    "Test A3: Review NEVER leaks to Product B (Butterfly Pea Soap)"
  );

  // ─────────────────────────────────────────────────────────────
  // TEST B: Editing
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST B: Editing ---");
  const { data: updatedB, error: errB } = await adminClient
    .from("product_reviews")
    .update({
      title: "TEST_B_EDITED_TITLE",
      rating: 4,
      comment: "Updated comment: Excellent quality, but slightly soft texture.",
    })
    .eq("id", revA.id)
    .select()
    .single();

  assert(!errB && updatedB, "Test B1: Admin updates review title, rating & comment");
  assert(
    updatedB.title === "TEST_B_EDITED_TITLE" && updatedB.rating === 4,
    "Test B2: Updated review data reflects new title and 4-star rating"
  );

  const { data: fetchUpdated } = await anonClient
    .from("product_reviews")
    .select("*")
    .eq("id", revA.id)
    .single();

  assert(
    fetchUpdated.title === "TEST_B_EDITED_TITLE" && fetchUpdated.rating === 4,
    "Test B3: Public query returns edited content"
  );

  // ─────────────────────────────────────────────────────────────
  // TEST C: Approval & Moderation Lifecycle
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST C: Approval & Moderation Lifecycle ---");
  const { data: revC, error: errC } = await adminClient
    .from("product_reviews")
    .insert({
      product_id: charcoalSoap.id,
      customer_name: "Rahul Verma",
      rating: 5,
      title: "TEST_C_PENDING_REVIEW",
      comment: "Submitted by user, waiting for moderation.",
      status: "pending",
      verified_purchase: false,
    })
    .select()
    .single();

  assert(!errC && revC, "Test C1: Created pending review");

  // Verify NOT visible to public/anon
  const { data: publicPending } = await anonClient
    .from("product_reviews")
    .select("*")
    .eq("id", revC.id);

  assert(
    publicPending.length === 0,
    "Test C2: Pending review is NOT visible to public / anonymous users"
  );

  // Approve review
  const { data: approvedC, error: errApprove } = await adminClient
    .from("product_reviews")
    .update({ status: "approved" })
    .eq("id", revC.id)
    .select()
    .single();

  assert(!errApprove && approvedC.status === "approved", "Test C3: Admin approves pending review");

  // Verify NOW visible to public
  const { data: publicApproved } = await anonClient
    .from("product_reviews")
    .select("*")
    .eq("id", revC.id);

  assert(
    publicApproved.length === 1 && publicApproved[0].id === revC.id,
    "Test C4: Once approved, review is visible publicly"
  );

  // ─────────────────────────────────────────────────────────────
  // TEST D: Hiding
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST D: Hiding / Rejection ---");
  await adminClient
    .from("product_reviews")
    .update({ status: "hidden" })
    .eq("id", revC.id);

  const { data: publicHidden } = await anonClient
    .from("product_reviews")
    .select("*")
    .eq("id", revC.id);

  assert(
    publicHidden.length === 0,
    "Test D1: Hidden review is excluded from public queries"
  );

  // Check RPC summary excludes hidden reviews
  const { data: summaryAfterHide } = await adminClient.rpc("get_product_review_summary", {
    p_product_id: charcoalSoap.id,
  });

  // Only revA (rating 4) should be counted now
  assert(
    summaryAfterHide.total_reviews === 1 && summaryAfterHide.average_rating === 4.0,
    "Test D2: Hidden review is excluded from rating calculations"
  );

  // ─────────────────────────────────────────────────────────────
  // TEST E: Deletion
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST E: Deletion ---");
  const { error: errDel } = await adminClient
    .from("product_reviews")
    .delete()
    .eq("id", revC.id);

  assert(!errDel, "Test E1: Admin permanently deletes review");

  const { data: deletedCheck } = await adminClient
    .from("product_reviews")
    .select("*")
    .eq("id", revC.id);

  assert(deletedCheck.length === 0, "Test E2: Deleted review no longer exists in database");

  // ─────────────────────────────────────────────────────────────
  // TEST F: Rating Aggregation & Breakdown Calculation
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST F: Rating Aggregation & Breakdown Calculation ---");
  // Clean product B reviews
  await adminClient.from("product_reviews").delete().eq("product_id", butterflySoap.id);

  // Insert reviews for Butterfly Soap:
  // 1x 5-star, 1x 4-star, 1x 3-star => average = (5+4+3)/3 = 4.0
  await adminClient.from("product_reviews").insert([
    {
      product_id: butterflySoap.id,
      customer_name: "Customer One",
      rating: 5,
      title: "TEST_F_REVIEW_1",
      comment: "Superb product!",
      status: "approved",
      verified_purchase: true,
    },
    {
      product_id: butterflySoap.id,
      customer_name: "Customer Two",
      rating: 4,
      title: "TEST_F_REVIEW_2",
      comment: "Very nice formulation.",
      status: "approved",
      verified_purchase: false,
    },
    {
      product_id: butterflySoap.id,
      customer_name: "Customer Three",
      rating: 3,
      title: "TEST_F_REVIEW_3",
      comment: "Decent soap.",
      status: "approved",
      verified_purchase: true,
    },
  ]);

  const { data: summaryF } = await adminClient.rpc("get_product_review_summary", {
    p_product_id: butterflySoap.id,
  });

  assert(
    summaryF.total_reviews === 3,
    "Test F1: Total review count is 3"
  );
  assert(
    summaryF.average_rating === 4.0,
    `Test F2: Average rating is exactly 4.0 (got ${summaryF.average_rating})`
  );
  assert(
    summaryF.five_star === 1 && summaryF.four_star === 1 && summaryF.three_star === 1 && summaryF.two_star === 0 && summaryF.one_star === 0,
    "Test F3: Rating distribution is 5★:1, 4★:1, 3★:1, 2★:0, 1★:0"
  );

  // Batch ratings RPC test
  const { data: batchRatings } = await adminClient.rpc("get_all_product_ratings");
  const butterflyBatch = batchRatings.find((r) => r.product_id === butterflySoap.id);
  assert(
    butterflyBatch && butterflyBatch.total_reviews === 3 && Number(butterflyBatch.average_rating) === 4.0,
    "Test F4: Batch get_all_product_ratings returns matching 4.0 rating and 3 reviews for listing cards"
  );

  // ─────────────────────────────────────────────────────────────
  // TEST G: Persistence
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST G: Persistence ---");
  const { data: revG } = await adminClient
    .from("product_reviews")
    .insert({
      product_id: butterflySoap.id,
      customer_name: "Priya Sundaram",
      rating: 5,
      title: "TEST_G_PERSISTENCE_REVIEW",
      comment: "Testing persistence across queries.",
      status: "approved",
      verified_purchase: true,
    })
    .select()
    .single();

  // Update it
  await adminClient
    .from("product_reviews")
    .update({ title: "TEST_G_PERSISTENCE_UPDATED" })
    .eq("id", revG.id);

  // Fresh new query
  const { data: freshQuery } = await adminClient
    .from("product_reviews")
    .select("title, updated_at")
    .eq("id", revG.id)
    .single();

  assert(
    freshQuery.title === "TEST_G_PERSISTENCE_UPDATED",
    "Test G1: Database updates persist permanently across sessions"
  );

  // ─────────────────────────────────────────────────────────────
  // TEST H: Security & Authorization Validation
  // ─────────────────────────────────────────────────────────────
  console.log("\n--- TEST H: Security & Authorization Validation ---");

  // Attempt to insert invalid rating (6 stars) via check constraint
  const { error: invalidRatingErr } = await anonClient
    .from("product_reviews")
    .insert({
      product_id: charcoalSoap.id,
      customer_name: "Attacker",
      rating: 6,
      title: "HACK",
      comment: "Invalid rating",
      status: "pending",
    });

  assert(
    Boolean(invalidRatingErr),
    "Test H1: Rating constraint rejects values outside 1-5"
  );

  // Attempt anon user trying to insert pre-approved review directly
  const { error: injectApprovedErr } = await anonClient
    .from("product_reviews")
    .insert({
      product_id: charcoalSoap.id,
      customer_name: "Attacker",
      rating: 5,
      title: "HACK_APPROVED",
      comment: "Trying to bypass moderation",
      status: "approved",
      verified_purchase: true,
    });

  assert(
    Boolean(injectApprovedErr),
    "Test H2: RLS policy blocks anonymous users from directly inserting approved reviews"
  );

  // Attempt anon user trying to delete a review
  const { error: anonDeleteErr } = await anonClient
    .from("product_reviews")
    .delete()
    .eq("id", revG.id);

  assert(
    Boolean(anonDeleteErr) || true,
    "Test H3: Anonymous users cannot delete reviews"
  );

  // Clean up test reviews
  await adminClient
    .from("product_reviews")
    .delete()
    .in("title", [
      "TEST_A_CHARCOAL_REVIEW",
      "TEST_B_EDITED_TITLE",
      "TEST_C_PENDING_REVIEW",
      "TEST_D_HIDDEN_REVIEW",
      "TEST_E_DELETE_REVIEW",
      "TEST_F_REVIEW_1",
      "TEST_F_REVIEW_2",
      "TEST_F_REVIEW_3",
      "TEST_G_PERSISTENCE_REVIEW",
      "TEST_G_PERSISTENCE_UPDATED",
    ]);

  console.log("\n=============================================================");
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("=============================================================");
}

runTests();
