const fs = require('fs');
const path = 'supabase/backups/saaral-db-backup-2026-11-01T12-10-47-004Z.json';
const raw = fs.readFileSync(path, 'utf8');
const backup = JSON.parse(raw);

console.log("Top-level keys:", Object.keys(backup));
for (const k of Object.keys(backup.tables)) {
  const t = backup.tables[k];
  console.log(`Table '${k}': type=${typeof t}, isArray=${Array.isArray(t)}, keys=${t ? Object.keys(t) : 'null'}`);
  if (t && t.rows) {
    console.log(`  rows count: ${t.rows.length}`);
  } else if (Array.isArray(t)) {
    console.log(`  array length: ${t.length}`);
  }
}

