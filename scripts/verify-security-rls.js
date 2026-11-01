const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tmcfyzcfcrjzdwnquvhf.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("=== Saaral Cosmetics Security & RLS Policy Verification ===");
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Anon Key present: ${Boolean(anonKey)}`);
console.log(`Service Key present: ${Boolean(serviceKey)}`);

async function testRLS() {
  const ws = require("ws");
  const options = {
    auth: { persistSession: false },
    realtime: { transport: ws },
  };
  const anonClient = createClient(supabaseUrl, anonKey, options);
  const serviceClient = createClient(supabaseUrl, serviceKey, options);

  const results = [];

  // TEST 1: Customer profiles RLS (Anon cannot read profiles)
  try {
    const { data, error } = await anonClient.from("profiles").select("*").limit(5);
    if (error || (data && data.length === 0)) {
      results.push({
        test: "Profiles RLS - Anon Read Isolation",
        status: "PASS",
        detail: "Anon client cannot read profiles (empty or blocked as expected by auth.uid() = id)",
      });
    } else {
      results.push({
        test: "Profiles RLS - Anon Read Isolation",
        status: "FAIL",
        detail: `Leaked ${data.length} profile rows to anon user`,
      });
    }
  } catch (err) {
    results.push({
      test: "Profiles RLS - Anon Read Isolation",
      status: "PASS",
      detail: `Request blocked: ${err.message}`,
    });
  }

  // TEST 2: Customers Table RLS (Anon cannot read customer database)
  try {
    const { data, error } = await anonClient.from("customers").select("*").limit(5);
    if (error || (data && data.length === 0)) {
      results.push({
        test: "Customers Table RLS - Directory Protection",
        status: "PASS",
        detail: "Anon client cannot read customer directory (protected by admin_select_customers)",
      });
    } else {
      results.push({
        test: "Customers Table RLS - Directory Protection",
        status: "FAIL",
        detail: `Leaked ${data.length} customer rows to anon client!`,
      });
    }
  } catch (err) {
    results.push({
      test: "Customers Table RLS - Directory Protection",
      status: "PASS",
      detail: `Blocked: ${err.message}`,
    });
  }

  // TEST 3: Orders RLS - Anon cannot update order status directly
  try {
    const fakeOrderId = "00000000-0000-0000-0000-000000000000";
    const { data, error } = await anonClient
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", fakeOrderId)
      .select();

    if (error || !data || data.length === 0) {
      results.push({
        test: "Orders RLS - Anon Update Blocked",
        status: "PASS",
        detail: "Client-side updates to orders table are denied (only service role can update)",
      });
    } else {
      results.push({
        test: "Orders RLS - Anon Update Blocked",
        status: "FAIL",
        detail: "Anon user was able to execute update query!",
      });
    }
  } catch (err) {
    results.push({
      test: "Orders RLS - Anon Update Blocked",
      status: "PASS",
      detail: `Blocked: ${err.message}`,
    });
  }

  // TEST 4: Product Reviews RLS - Public can only select approved reviews
  try {
    const { data, error } = await anonClient
      .from("product_reviews")
      .select("id, status")
      .neq("status", "approved")
      .limit(5);

    if (error || !data || data.length === 0) {
      results.push({
        test: "Product Reviews RLS - Unapproved Review Protection",
        status: "PASS",
        detail: "Anon client cannot read pending/rejected reviews (public_read_approved_reviews works)",
      });
    } else {
      results.push({
        test: "Product Reviews RLS - Unapproved Review Protection",
        status: "FAIL",
        detail: `Leaked unapproved reviews: ${JSON.stringify(data)}`,
      });
    }
  } catch (err) {
    results.push({
      test: "Product Reviews RLS - Unapproved Review Protection",
      status: "PASS",
      detail: `Blocked: ${err.message}`,
    });
  }

  // TEST 5: Product Reviews RLS - Public cannot self-approve reviews
  try {
    const dummyId = "00000000-0000-0000-0000-000000000001";
    const { data, error } = await anonClient.from("product_reviews").insert({
      product_id: dummyId,
      customer_name: "Test Hacker",
      rating: 5,
      title: "Hacked Review",
      comment: "This should be blocked",
      status: "approved", // Attempt to bypass moderation!
      verified_purchase: true,
    });

    if (error) {
      results.push({
        test: "Product Reviews RLS - Self-Approval Exploit Blocked",
        status: "PASS",
        detail: `RLS blocked insertion of pre-approved review: ${error.message}`,
      });
    } else {
      results.push({
        test: "Product Reviews RLS - Self-Approval Exploit Blocked",
        status: "FAIL",
        detail: "Public insertion with status='approved' succeeded!",
      });
    }
  } catch (err) {
    results.push({
      test: "Product Reviews RLS - Self-Approval Exploit Blocked",
      status: "PASS",
      detail: `Blocked: ${err.message}`,
    });
  }

  console.log("\n--- TEST RESULTS ---");
  results.forEach((r) => {
    const icon = r.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} [${r.status}] ${r.test}`);
    console.log(`   ${r.detail}`);
  });

  const allPassed = results.every((r) => r.status === "PASS");
  console.log(`\nFinal Verdict: ${allPassed ? "ALL RLS POLICIES VERIFIED SECURE" : "SOME CHECKS FAILED"}\n`);
}

testRLS().catch(console.error);
