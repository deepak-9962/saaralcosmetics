const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const ws = require('ws');

const content = fs.readFileSync('.env.local', 'utf8');
const env = {};
content.split('\n').forEach(l => {
  const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2]||'').replace(/^"|"$/g, '').trim();
});

const serviceClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

async function run() {
  const { data: { users }, error } = await serviceClient.auth.admin.listUsers();
  if (error) {
    console.error('listUsers error:', error);
    return;
  }
  console.log('Total users in auth.users:', users.length);
  users.forEach(u => {
    console.log(`User ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, app_metadata: ${JSON.stringify(u.app_metadata)}, user_metadata: ${JSON.stringify(u.user_metadata)}`);
  });
}
run();

