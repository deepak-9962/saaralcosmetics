const http = require("http");

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

const TEST_ENDPOINTS = [
  "/api/health",
  "/api/products/search?q=soap",
  "/api/products/ratings",
  "/products",
  "/",
];

function fetchEndpoint(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const duration = Date.now() - start;
        resolve({
          url,
          status: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        url,
        status: 0,
        duration: Date.now() - start,
        success: false,
        error: err.message,
      });
    });

    req.setTimeout(25000, () => {
      req.destroy();
      resolve({
        url,
        status: 504,
        duration: 25000,
        success: false,
        error: "Timeout",
      });
    });
  });
}

function calculatePercentile(numbers, percentile) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function runConcurrencyBatch(concurrency, totalRequests) {
  console.log(`\n======================================================`);
  console.log(`🚀 RUNNING LOAD TEST: Concurrency = ${concurrency}, Total Requests = ${totalRequests}`);
  console.log(`======================================================`);

  const results = [];
  const startTime = Date.now();

  let completed = 0;
  let inFlight = 0;
  let requestIndex = 0;

  return new Promise((resolve) => {
    function launchNext() {
      if (completed >= totalRequests) {
        const totalDurationMs = Date.now() - startTime;
        const durations = results.map((r) => r.duration);
        const successes = results.filter((r) => r.success).length;
        const failures = totalRequests - successes;

        const summary = {
          concurrency,
          totalRequests,
          successes,
          failures,
          errorRate: ((failures / totalRequests) * 100).toFixed(2) + "%",
          totalDurationSec: (totalDurationMs / 1000).toFixed(2) + "s",
          rps: (totalRequests / (totalDurationMs / 1000)).toFixed(1),
          minMs: Math.min(...durations),
          p50Ms: calculatePercentile(durations, 50),
          p95Ms: calculatePercentile(durations, 95),
          p99Ms: calculatePercentile(durations, 99),
          maxMs: Math.max(...durations),
        };

        console.log(`  Total Time: ${summary.totalDurationSec} (${summary.rps} req/sec)`);
        console.log(`  Success / Failure: ${summary.successes} / ${summary.failures} (Error Rate: ${summary.errorRate})`);
        console.log(`  Latency: min=${summary.minMs}ms | p50=${summary.p50Ms}ms | p95=${summary.p95Ms}ms | p99=${summary.p99Ms}ms | max=${summary.maxMs}ms`);
        resolve(summary);
        return;
      }

      while (inFlight < concurrency && requestIndex < totalRequests) {
        inFlight++;
        const endpoint = TEST_ENDPOINTS[requestIndex % TEST_ENDPOINTS.length];
        requestIndex++;

        fetchEndpoint(`${BASE_URL}${endpoint}`).then((res) => {
          inFlight--;
          completed++;
          results.push(res);
          launchNext();
        });
      }
    }

    launchNext();
  });
}

async function main() {
  console.log("=== Saaral Cosmetics Concurrent Load Test ===");
  console.log(`Target: ${BASE_URL}\n`);

  // Warm up
  console.log("Warming up endpoints...");
  await Promise.all(TEST_ENDPOINTS.map((e) => fetchEndpoint(`${BASE_URL}${e}`)));

  const report10 = await runConcurrencyBatch(10, 40);
  const report25 = await runConcurrencyBatch(25, 75);
  const report50 = await runConcurrencyBatch(50, 100);

  console.log("\n======================================================");
  console.log("📊 LOAD TEST SUMMARY MATRIX");
  console.log("======================================================");
  console.table([report10, report25, report50]);

  const passed =
    parseFloat(report10.errorRate) === 0 &&
    parseFloat(report25.errorRate) === 0 &&
    parseFloat(report50.errorRate) === 0;

  console.log(`\nLoad test result: ${passed ? "PASSED (0% error rate across all tiers)" : "WARNING: Errors detected"}`);
}

main().catch(console.error);
