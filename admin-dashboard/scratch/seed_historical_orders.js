import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedOrders() {
  // 1. Get a customer
  const { data: profile } = await supabase.from('profiles').select('id').eq('role', 'customer').limit(1).single();
  if (!profile) {
    console.error('No customer found to seed orders for.');
    return;
  }
  const userId = profile.id;

  // 2. Generate historical orders (last 6 months)
  const orders = [];
  const now = new Date();
  
  for (let i = 1; i <= 6; i++) {
    const orderDate = new Date(now);
    orderDate.setMonth(now.getMonth() - i);
    
    // Create 1-2 orders per month
    const count = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < count; j++) {
      const total = Math.floor(Math.random() * 15000000) + 5000000; // 5M - 20M RWF
      orders.push({
        user_id: userId,
        total: total,
        status: 'delivered',
        payment_status: 'paid',
        payment_method: 'momo',
        created_at: orderDate.toISOString(),
        order_number: 'SEED' + Math.random().toString(36).substring(2, 8).toUpperCase()
      });
    }
  }

  const { error } = await supabase.from('orders').insert(orders);
  if (error) {
    console.error('Error seeding orders:', error.message);
  } else {
    console.log(`Successfully seeded ${orders.length} historical orders.`);
  }
}

seedOrders();
