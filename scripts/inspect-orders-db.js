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
  realtime: { transport: ws }
});

async function run() {
  // Let's check all orders in the DB
  const { data: orders, error } = await serviceClient.from('orders').select('id, user_id, order_number, customer_name, payment_status');
  console.log('Total orders in DB:', orders ? orders.length : error);
  if (orders) {
    const withUserId = orders.filter(o => o.user_id !== null);
    console.log('Orders with non-null user_id:', withUserId.length);
    console.log('Orders with null user_id (guest checkouts):', orders.length - withUserId.length);
  }
}
run();

