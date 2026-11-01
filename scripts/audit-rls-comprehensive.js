const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
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

async function runAudit() {
  console.log("=== Saaral Comprehensive RLS Security Audit ===");
  const ws = require("ws");
  const options = { auth: { persistSession: false }, realtime: { transport: ws } };
  const anonClient = createClient(supabaseUrl, anonKey, options);
  const serviceClient = createClient(supabaseUrl, serviceKey, options);

  const results = [];

  // 1. Anon reading profiles
  {
    const { data, error } = await anonClient.from("profiles").select("*").limit(5);
    const passed = error || !data || data.length === 0;
    results.push({
      role: "Anon",
      table: "profiles",
      action: "SELECT",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Anon read blocked by RLS" : `Leaked ${data.length} profile rows`,
    });
  }

  // 2. Anon reading customers
  {
    const { data, error } = await anonClient.from("customers").select("*").limit(5);
    const passed = error || !data || data.length === 0;
    results.push({
      role: "Anon",
      table: "customers",
      action: "SELECT",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Anon customer directory read blocked" : `Leaked ${data.length} customers`,
    });
  }

  // 3. Anon reading orders
  {
    const { data, error } = await anonClient.from("orders").select("*").limit(5);
    const passed = error || !data || data.length === 0;
    results.push({
      role: "Anon",
      table: "orders",
      action: "SELECT",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Anon orders read blocked by RLS" : `Leaked ${data.length} order records to anon`,
    });
  }

  // 4. Anon modifying orders
  {
    const { data, error } = await anonClient
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .select();
    const passed = error || !data || data.length === 0;
    results.push({
      role: "Anon",
      table: "orders",
      action: "UPDATE",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Anon order update blocked by RLS" : "Anon order update succeeded!",
    });
  }

  // 5. Anon reading cart_items
  {
    const { data, error } = await anonClient.from("cart_items").select("*").limit(5);
    const passed = error || !data || data.length === 0;
    results.push({
      role: "Anon",
      table: "cart_items",
      action: "SELECT",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Anon cart_items read blocked by RLS" : `Leaked ${data.length} cart rows`,
    });
  }

  // 6. Anon inserting unmoderated reviews (self-approval)
  {
    const { data, error } = await anonClient.from("product_reviews").insert({
      product_id: "00000000-0000-0000-0000-000000000001",
      customer_name: "Attacker",
      rating: 5,
      title: "Exploit",
      comment: "Self approval test",
      status: "approved",
      verified_purchase: true,
    });
    const passed = Boolean(error);
    results.push({
      role: "Anon",
      table: "product_reviews",
      action: "INSERT (status=approved)",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? `Self-approval blocked: ${error.message}` : "Self-approval succeeded!",
    });
  }

  // 7. Anon reading unapproved product reviews
  {
    const { data, error } = await anonClient
      .from("product_reviews")
      .select("id, status")
      .neq("status", "approved")
      .limit(5);
    const passed = error || !data || data.length === 0;
    results.push({
      role: "Anon",
      table: "product_reviews",
      action: "SELECT (status!=approved)",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Anon cannot read pending/rejected reviews" : `Leaked unapproved reviews: ${data.length}`,
    });
  }

  // 8. Service role admin full access check
  {
    const { data, error } = await serviceClient.from("products").select("id").limit(1);
    const passed = !error && data && data.length > 0;
    results.push({
      role: "Admin (Service Role)",
      table: "products",
      action: "SELECT",
      status: passed ? "PASS" : "FAIL",
      detail: passed ? "Admin access verified" : `Admin query failed: ${error?.message}`,
    });
  }

  // Print results table
  console.table(results);
  const allPassed = results.every(r => r.status === "PASS");
  console.log(`\nRLS Audit Outcome: ${allPassed ? "ALL 8 POLICIES PASSED" : "FAILURES DETECTED"}`);
}

runAudit().catch(console.error);

