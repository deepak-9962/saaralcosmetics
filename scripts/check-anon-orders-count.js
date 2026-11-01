const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const ws = require('ws');

const content = fs.readFileSync('.env.local', 'utf8');
const env = {};
content.split('\n').forEach(l => {
  const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2]||'').replace(/^"|"$/g, '').trim();
});

const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  const { data: anonOrders, error } = await anonClient.from('orders').select('id, user_id');
  console.log('Anon client query: count =', anonOrders ? anonOrders.length : error);
  if (anonOrders) {
    console.log('Non-null user_id count visible to anon:', anonOrders.filter(o => o.user_id !== null).length);
  }
}
run();

