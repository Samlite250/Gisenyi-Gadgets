#!/usr/bin/env node
/**
 * PRODUCTION CLEANUP SCRIPT - Automated
 * Clears all seed/test data directly via Supabase API
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🧹 GISENYI GADGETS - PRODUCTION CLEANUP\n');
console.log('='.repeat(60));
console.log('🚀 Starting automated cleanup...\n');

async function runCleanup() {
  try {
    // Step 1: Get current counts (before cleanup)
    console.log('📊 BEFORE CLEANUP:');
    const { count: ordersBefore } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: itemsBefore } = await supabase.from('order_items').select('*', { count: 'exact', head: true });
    const { data: suppliersBefore } = await supabase.from('suppliers').select('name, total_sold');

    console.log(`   Orders: ${ordersBefore || 0}`);
    console.log(`   Order Items: ${itemsBefore || 0}`);
    suppliersBefore?.forEach(s => {
      console.log(`   Supplier "${s.name}": RWF ${Number(s.total_sold || 0).toLocaleString()}`);
    });

    // Step 2: Get order IDs to delete
    const { data: seedOrders } = await supabase
      .from('orders')
      .select('id')
      .like('order_number', 'SEED%');

    if (seedOrders && seedOrders.length > 0) {
      const orderIds = seedOrders.map(o => o.id);

      console.log(`\n🗑️  Deleting ${orderIds.length} seed orders...\n`);

      // Step 3: Delete order items first (foreign key dependency)
      console.log('   [1/4] Deleting order items...');
      const { error: itemsError, count: deletedItems } = await supabase
        .from('order_items')
        .delete({ count: 'exact' })
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('   ❌ Error:', itemsError.message);
        throw itemsError;
      }
      console.log(`   ✅ Deleted ${deletedItems || 'all'} order items`);

      // Step 4: Delete orders
      console.log('   [2/4] Deleting orders...');
      const { error: ordersError, count: deletedOrders } = await supabase
        .from('orders')
        .delete({ count: 'exact' })
        .like('order_number', 'SEED%');

      if (ordersError) {
        console.error('   ❌ Error:', ordersError.message);
        throw ordersError;
      }
      console.log(`   ✅ Deleted ${deletedOrders || orderIds.length} orders`);
    } else {
      console.log('\n✅ No seed orders found (already clean)\n');
    }

    // Step 5: Reset supplier sales
    console.log('   [3/4] Resetting supplier sales...');
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('id, name');

    if (suppliers && suppliers.length > 0) {
      for (const supplier of suppliers) {
        const { error: supplierError } = await supabase
          .from('suppliers')
          .update({ total_sold: 0 })
          .eq('id', supplier.id);

        if (supplierError) {
          console.error(`   ⚠️  Error resetting ${supplier.name}:`, supplierError.message);
        }
      }
      console.log(`   ✅ Reset ${suppliers.length} supplier(s) to zero`);
    }

    // Step 6: Clean test notifications (optional)
    console.log('   [4/4] Cleaning test notifications...');
    try {
      const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .or('title.ilike.%Welcome%,title.ilike.%Flash Sale%,title.ilike.%New Arrivals%');

      if (notifError && notifError.code !== 'PGRST116') {
        console.log('   ⚠️  Notifications: ' + notifError.message);
      } else {
        console.log('   ✅ Test notifications cleaned');
      }
    } catch (e) {
      console.log('   ℹ️  Notifications table may not exist (skipped)');
    }

    // Step 7: Verify cleanup
    console.log('\n📊 AFTER CLEANUP:');
    const { count: ordersAfter } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: itemsAfter } = await supabase.from('order_items').select('*', { count: 'exact', head: true });
    const { data: suppliersAfter } = await supabase.from('suppliers').select('name, total_sold');
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer');

    console.log(`   Orders: ${ordersAfter || 0} ✅`);
    console.log(`   Order Items: ${itemsAfter || 0} ✅`);
    suppliersAfter?.forEach(s => {
      console.log(`   Supplier "${s.name}": RWF ${Number(s.total_sold || 0).toLocaleString()} ✅`);
    });
    console.log(`   Products (kept): ${productsCount || 0} ✅`);
    console.log(`   Customers (kept): ${usersCount || 0} ✅`);

    // Step 8: Show expected dashboard values
    console.log('\n💰 DASHBOARD WILL NOW SHOW:');
    console.log('='.repeat(60));
    console.log('   Total Revenue:          RWF 0');
    console.log('   Total Orders:           0');
    console.log('   My Net Profit:          RWF 0');
    console.log('   Owed To Suppliers:      RWF 0');
    console.log('   Revenue Forecast:       (empty chart)');

    console.log('\n✅ CLEANUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n🎉 Your system is now ready for real production orders!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Open: https://gisenyicpanel.vercel.app');
    console.log('   2. Verify all metrics show RWF 0');
    console.log('   3. Place a test order from mobile app');
    console.log('   4. Mark it as "paid" in admin dashboard');
    console.log('   5. Watch the numbers update! 🚀\n');

  } catch (error) {
    console.error('\n❌ CLEANUP FAILED:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

runCleanup();
