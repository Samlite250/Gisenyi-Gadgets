import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrders() {
  const { data, error } = await supabase.from('orders').select('created_at, total');
  if (error) {
    console.error('Error fetching orders:', error.message);
    return;
  }
  
  console.log(`Found ${data.length} orders.`);
  const monthCounts = {};
  data.forEach(o => {
    const d = new Date(o.created_at);
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const key = `${month} ${year}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });
  console.log('Order counts per month:', monthCounts);
}

checkOrders();
