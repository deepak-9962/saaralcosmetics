const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const ws = require('ws');

const content = fs.readFileSync('.env.local', 'utf8');
const env = {};
content.split('\n').forEach(l => {
  const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2]||'').replace(/^"|"$/g, '').trim();
});
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});
async function run() {
  const res = await client.from('orders').select('id, user_id, order_number, customer_name, total').limit(5);
  console.log('Anon query result:', JSON.stringify(res, null, 2));
}
run();
