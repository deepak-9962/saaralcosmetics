const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const ws = require("ws");

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

async function clearSampleData() {
  console.log("=== Clearing Sample Order & Test Data for Production ===");

  // 1. Delete promo code redemptions
  console.log("\n1. Clearing promo_code_redemptions...");
  const { error: redemptionsErr } = await supabase
    .from("promo_code_redemptions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows

  if (redemptionsErr) {
    console.error("Error clearing promo_code_redemptions:", redemptionsErr);
  } else {
    console.log("✅ promo_code_redemptions cleared.");
  }

  // 2. Delete all orders
  console.log("\n2. Clearing orders table...");
  const { error: ordersErr } = await supabase
    .from("orders")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows

  if (ordersErr) {
    console.error("Error clearing orders:", ordersErr);
  } else {
    console.log("✅ orders table cleared.");
  }

  // 3. Delete all test customers created by the order sync trigger
  console.log("\n3. Clearing customers table...");
  const { error: customersErr } = await supabase
    .from("customers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows

  if (customersErr) {
    console.error("Error clearing customers:", customersErr);
  } else {
    console.log("✅ customers table cleared.");
  }

  // 4. Reset promo code times_used back to 0
  console.log("\n4. Resetting promo code usage counts...");
  const { error: promoErr } = await supabase
    .from("promo_codes")
    .update({ times_used: 0 })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (promoErr) {
    console.error("Error resetting promo_codes times_used:", promoErr);
  } else {
    console.log("✅ promo_codes times_used reset to 0.");
  }

  // 5. Verification
  console.log("\n=== Verifying Final Counts ===");
  const { count: finalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { count: finalCustomers } = await supabase.from("customers").select("*", { count: "exact", head: true });
  const { count: finalRedemptions } = await supabase.from("promo_code_redemptions").select("*", { count: "exact", head: true });

  console.log(`Orders count: ${finalOrders} (expected: 0)`);
  console.log(`Customers count: ${finalCustomers} (expected: 0)`);
  console.log(`Promo redemptions count: ${finalRedemptions} (expected: 0)`);
}

clearSampleData();
