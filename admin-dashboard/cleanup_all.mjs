#!/usr/bin/env node
/**
 * COMPLETE CLEANUP - Delete ALL orders (seed and non-seed)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🧹 COMPLETE DATABASE CLEANUP - DELETE ALL ORDERS\n');
console.log('='.repeat(60));

async function cleanupAll() {
  try {
    // Check what we have
    const { data: orders } = await supabase.from('orders').select('order_number, payment_status');
    console.log(`\n📦 Found ${orders?.length || 0} orders to delete:\n`);
    orders?.slice(0, 10).forEach(o => console.log(`   - ${o.order_number} (${o.payment_status})`));
    if (orders?.length > 10) console.log(`   ... and ${orders.length - 10} more`);

    // Delete ALL order items first
    console.log('\n🗑️  [1/3] Deleting ALL order items...');
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (itemsError) throw itemsError;
    console.log('   ✅ All order items deleted');

    // Delete ALL orders
    console.log('   [2/3] Deleting ALL orders...');
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (ordersError) throw ordersError;
    console.log('   ✅ All orders deleted');

    // Reset suppliers
    console.log('   [3/3] Resetting suppliers...');
    const { data: suppliers } = await supabase.from('suppliers').select('id');

    for (const s of (suppliers || [])) {
      await supabase.from('suppliers').update({ total_sold: 0 }).eq('id', s.id);
    }
    console.log('   ✅ All suppliers reset to zero');

    // Verify
    const { count: finalCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: finalItems } = await supabase.from('order_items').select('*', { count: 'exact', head: true });

    console.log('\n📊 FINAL STATE:');
    console.log(`   Orders: ${finalCount || 0} ✅`);
    console.log(`   Order Items: ${finalItems || 0} ✅`);

    console.log('\n✅ COMPLETE CLEANUP DONE!\n');
    console.log('🎉 Database is now completely clean and ready for production!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupAll();
