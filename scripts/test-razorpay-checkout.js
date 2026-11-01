const http = require("http");
const crypto = require("crypto");
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

const BASE_URL = "http://localhost:3000";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

function sendPost(endpoint, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = typeof body === "string" ? body : JSON.stringify(body);
    const url = new URL(endpoint, BASE_URL);

    const req = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          ...headers,
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

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== Saaral Razorpay Checkout & Webhook Security Tests ===");
  console.log(`Webhook secret configured: ${Boolean(WEBHOOK_SECRET)}`);

  const results = [];

  // TEST 1: Bad Webhook Signature
  {
    const payload = JSON.stringify({ event: "payment.captured", test: true });
    const res = await sendPost("/api/webhooks/razorpay", payload, {
      "x-razorpay-signature": "bad_invalid_signature_hex_1234567890abcdef",
    });
    const passed = res.status === 400;
    results.push({
      test: "Webhook Bad Signature Rejection",
      expected: "HTTP 400",
      actual: `HTTP ${res.status} - ${JSON.stringify(res.data || res.raw)}`,
      status: passed ? "PASS" : "FAIL",
    });
  }

  // TEST 2: Missing Webhook Signature
  {
    const payload = JSON.stringify({ event: "payment.captured", test: true });
    const res = await sendPost("/api/webhooks/razorpay", payload, {});
    const passed = res.status === 400;
    results.push({
      test: "Webhook Missing Signature Rejection",
      expected: "HTTP 400",
      actual: `HTTP ${res.status} - ${JSON.stringify(res.data || res.raw)}`,
      status: passed ? "PASS" : "FAIL",
    });
  }

  // TEST 3: Valid Signature with Failed Payment Event
  {
    const payloadObj = {
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_test_failed_123",
            order_id: "order_non_existent_999",
            error_description: "Card declined by issuing bank",
          },
        },
      },
    };
    const payloadStr = JSON.stringify(payloadObj);
    const validSig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payloadStr).digest("hex");

    const res = await sendPost("/api/webhooks/razorpay", payloadStr, {
      "x-razorpay-signature": validSig,
    });
    const passed = res.status === 200 && res.data?.status === "recorded_failure";
    results.push({
      test: "Webhook Failed Payment Handling",
      expected: "HTTP 200 {status: recorded_failure}",
      actual: `HTTP ${res.status} - ${JSON.stringify(res.data)}`,
      status: passed ? "PASS" : "FAIL",
    });
  }

  // TEST 4: Forged Payment Verification Details
  {
    const forgedBody = {
      orderId: "d051d7c2-fce5-41c1-8d61-81dafde8d7eb", // valid uuid format but forged
      razorpay_payment_id: "pay_test1234567890",
      razorpay_order_id: "order_test123456789",
      razorpay_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    };
    const res = await sendPost("/api/verify-payment", forgedBody);
    const passed = res.status === 404 || res.status === 400;
    results.push({
      test: "Verify-Payment Forged Order Id Rejection",
      expected: "HTTP 404/400 (Order not found or signature mismatch)",
      actual: `HTTP ${res.status} - ${JSON.stringify(res.data)}`,
      status: passed ? "PASS" : "FAIL",
    });
  }

  // TEST 5: Verify-Payment Malformed Fields
  {
    const malformedBody = {
      orderId: "invalid-uuid",
      razorpay_payment_id: "short",
      razorpay_order_id: "bad_order",
      razorpay_signature: "not-hex",
    };
    const res = await sendPost("/api/verify-payment", malformedBody);
    const passed = res.status === 400;
    results.push({
      test: "Verify-Payment Regex Validation",
      expected: "HTTP 400 Invalid orderId / format",
      actual: `HTTP ${res.status} - ${JSON.stringify(res.data)}`,
      status: passed ? "PASS" : "FAIL",
    });
  }

  // TEST 6: Rate Limiting on Verify-Payment (10 req/min limit)
  {
    let rateLimited = false;
    for (let i = 0; i < 15; i++) {
      const res = await sendPost("/api/verify-payment", {
        orderId: "invalid-uuid",
        razorpay_payment_id: "short",
        razorpay_order_id: "bad_order",
        razorpay_signature: "not-hex",
      });
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    results.push({
      test: "Verify-Payment Rate Limiter (Max 10 req/min)",
      expected: "HTTP 429 after 10 requests",
      actual: rateLimited ? "HTTP 429 received" : "Did not trigger 429",
      status: rateLimited ? "PASS" : "FAIL",
    });
  }

  console.table(results);
}

runTests().catch(console.error);

