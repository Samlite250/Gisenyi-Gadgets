import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdsaemjngaamvgjlooyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2FlbWpuZ2FhbXZnamxvb3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3NjcsImV4cCI6MjA5MjU1ODc2N30.zFgCoZs4R_gT5cGiQA2WLn9fUuzIcogUkWOy3A1WtwI';
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
    const month = new Date(o.created_at).toLocaleString('default', { month: 'short' });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  console.log('Order counts per month:', monthCounts);
}

checkOrders();
