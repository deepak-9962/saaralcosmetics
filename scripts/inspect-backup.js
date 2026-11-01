const fs = require('fs');
const path = 'supabase/backups/saaral-db-backup-2026-11-01T12-10-47-004Z.json';

const raw = fs.readFileSync(path, 'utf8');
const backup = JSON.parse(raw);

console.log("=== Saaral DB Backup Inspection ===");
console.log("Exported At:", backup.exportedAt);
console.log("Supabase Project URL:", backup.projectUrl);
console.log("Total Tables in Backup:", Object.keys(backup.tables || {}).length);

console.log("\nTable Breakdown:");
const breakdown = Object.entries(backup.tables || {}).map(([table, rows]) => ({
  table,
  rowCount: Array.isArray(rows) ? rows.length : (rows?.length ?? "N/A"),
  sampleFields: Array.isArray(rows) && rows[0] ? Object.keys(rows[0]).slice(0, 5).join(", ") : "Empty"
}));

console.table(breakdown);

// Check coverage against known required application tables
const REQUIRED_TABLES = [
  "products",
  "categories",
  "orders",
  "customers",
  "profiles",
  "combos",
  "hero_slides",
  "homepage_categories",
  "product_reviews",
  "promo_codes",
  "cart_items",
  "customer_transformations"
];

const missing = REQUIRED_TABLES.filter(t => !backup.tables[t]);
console.log("\nMissing Required Application Tables in Backup:", missing.length > 0 ? missing : "None! All 12 tables present.");

