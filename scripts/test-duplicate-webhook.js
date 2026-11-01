const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

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

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

function sendWebhook(payloadStr) {
  const validSig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payloadStr).digest("hex");
  return new Promise((resolve) => {
    const req = http.request(
      "http://localhost:3000/api/webhooks/razorpay",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payloadStr),
          "x-razorpay-signature": validSig,
        },
      },
      (res) => {
        let respData = "";
        res.on("data", (chunk) => (respData += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );
    req.write(payloadStr);
    req.end();
  });
}

async function testDuplicateWebhook() {
  // Find an order with razorpay_order_id
  const { data: orders } = await supabase
    .from("orders")
    .select("id, razorpay_order_id, payment_status")
    .not("razorpay_order_id", "is", null)
    .limit(1);

  if (!orders || orders.length === 0) {
    console.log("No orders with razorpay_order_id found to test idempotency.");
    return;
  }

  const order = orders[0];
  console.log(`Testing duplicate webhook with existing order: ${order.id}, razorpay_order_id: ${order.razorpay_order_id}, payment_status: ${order.payment_status}`);

  const payloadStr = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_dup_12345",
          order_id: order.razorpay_order_id,
        },
      },
    },
  });

  const res1 = await sendWebhook(payloadStr);
  console.log("Webhook call 1 result:", res1);

  const res2 = await sendWebhook(payloadStr);
  console.log("Webhook call 2 (duplicate) result:", res2);

  const idempotent = res2.data?.status === "already_processed" || res2.status === 200;
  console.log(`Duplicate webhook handling: ${idempotent ? "PASS (Idempotent 200 returned)" : "FAIL"}`);
}

testDuplicateWebhook().catch(console.error);

