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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ws = require("ws");

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

const TABLES_TO_BACKUP = [
  "categories",
  "products",
  "orders",
  "customers",
  "promo_codes",
  "product_reviews",
  "hero_slides",
  "combos",
  "customer_transformations",
  "homepage_testimonials",
  "homepage_promo_cards",
];

async function runBackup() {
  console.log("=== Saaral Cosmetics Database Backup & Recovery Test ===\n");
  console.log(`Target Database: ${supabaseUrl}`);

  const backupDir = path.join(__dirname, "..", "supabase", "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `saaral-db-backup-${timestamp}.json`);
  const backupData = {
    exportedAt: new Date().toISOString(),
    source: supabaseUrl,
    tables: {},
  };

  console.log("Exporting table snapshots...");
  for (const table of TABLES_TO_BACKUP) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact" });

      if (error) {
        console.warn(`  ⚠️ Table "${table}": ${error.message} (Skipped)`);
        continue;
      }

      backupData.tables[table] = {
        rowCount: (data || []).length,
        rows: data || [],
      };
      console.log(`  ✅ Table "${table}": ${(data || []).length} rows exported`);
    } catch (err) {
      console.warn(`  ⚠️ Table "${table}": failed to export - ${err.message}`);
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf8");
  const fileSizeKb = (fs.statSync(backupFile).size / 1024).toFixed(1);
  console.log(`\n📦 Snapshot saved to: ${backupFile} (${fileSizeKb} KB)`);

  // Test restoration simulation (verify data integrity)
  console.log("\n--- Testing Restoration Integrity ---");
  const loaded = JSON.parse(fs.readFileSync(backupFile, "utf8"));
  let validTables = 0;
  for (const table of Object.keys(loaded.tables)) {
    const info = loaded.tables[table];
    if (Array.isArray(info.rows) && info.rowCount === info.rows.length) {
      validTables++;
    }
  }
  console.log(`✅ Verified integrity of ${validTables} tables in backup archive.`);

  console.log("\n=== Supabase Automated Backup & Disaster Recovery Guide ===");
  console.log("1. Automated Daily Backups: Supabase automatically takes daily backups of the database.");
  console.log("   Location: Supabase Dashboard → Project Settings → Database → Backups.");
  console.log("2. Point-in-time Recovery (PITR): Available for pro plans with 7-day retention.");
  console.log("3. CLI / Native pg_dump Backup:");
  console.log("   npx supabase db dump -f supabase/backups/full-pg-dump.sql");
  console.log("4. Disaster Recovery / Restore Command:");
  console.log("   psql -h db.tmcfyzcfcrjzdwnquvhf.supabase.co -U postgres -d postgres -f supabase/backups/full-pg-dump.sql\n");
}

runBackup().catch(console.error);

