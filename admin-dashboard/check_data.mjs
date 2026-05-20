// Database Data Verification Script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🔍 GISENYI GADGETS - DATABASE AUDIT\n');
console.log('='.repeat(60));

try {
  // 1. Check Orders
  console.log('\n📦 ORDERS TABLE:');
  const { data: orders, count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact' });

  console.log(`Total Orders: ${orderCount || 0}`);

  if (orders && orders.length > 0) {
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const unpaidOrders = orders.filter(o => o.payment_status !== 'paid');

    console.log(`  - Paid Orders: ${paidOrders.length}`);
    console.log(`  - Unpaid Orders: ${unpaidOrders.length}`);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    console.log(`  - Total Revenue (paid only): RWF ${totalRevenue.toLocaleString()}`);

    console.log('\n  Sample Orders:');
    orders.slice(0, 5).forEach(o => {
      console.log(`    ${o.order_number}: RWF ${Number(o.total).toLocaleString()} - ${o.payment_status} - ${o.status}`);
    });
  } else {
    console.log('  ⚠️ No orders in database');
  }

  // 2. Check Suppliers
  console.log('\n🤝 SUPPLIERS TABLE:');
  const { data: suppliers, count: supplierCount } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact' });

  console.log(`Total Suppliers: ${supplierCount || 0}`);

  if (suppliers && suppliers.length > 0) {
    const totalSupplierSales = suppliers.reduce((sum, s) => sum + Number(s.total_sold || 0), 0);
    const totalOwed = suppliers.reduce((sum, s) => {
      const sold = Number(s.total_sold || 0);
      const rate = Number(s.commission_rate || 0);
      return sum + (sold * (1 - rate / 100));
    }, 0);
    const totalCommissions = suppliers.reduce((sum, s) => {
      const sold = Number(s.total_sold || 0);
      const rate = Number(s.commission_rate || 0);
      return sum + (sold * (rate / 100));
    }, 0);

    console.log(`  - Total Supplier Sales: RWF ${totalSupplierSales.toLocaleString()}`);
    console.log(`  - Total Owed to Suppliers: RWF ${totalOwed.toLocaleString()}`);
    console.log(`  - Total Your Commissions: RWF ${totalCommissions.toLocaleString()}`);

    console.log('\n  Supplier Breakdown:');
    suppliers.forEach(s => {
      const sold = Number(s.total_sold || 0);
      const rate = Number(s.commission_rate || 0);
      const owed = sold * (1 - rate / 100);
      const commission = sold * (rate / 100);
      console.log(`    ${s.name}:`);
      console.log(`      - Total Sales: RWF ${sold.toLocaleString()}`);
      console.log(`      - Commission Rate: ${rate}%`);
      console.log(`      - You Owe Them: RWF ${owed.toLocaleString()}`);
      console.log(`      - Your Commission: RWF ${commission.toLocaleString()}`);
    });
  } else {
    console.log('  ⚠️ No suppliers in database');
  }

  // 3. Check Products & Users
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer');

  console.log(`\n📱 Total Active Products: ${productCount || 0}`);
  console.log(`👥 Total Customers: ${userCount || 0}`);

  // 4. Calculate Financial Metrics
  console.log('\n💰 DASHBOARD FINANCIAL METRICS:');
  console.log('='.repeat(60));

  if (orders && suppliers) {
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const totalSupplierSales = suppliers.reduce((sum, s) => sum + Number(s.total_sold || 0), 0);
    const ownStockRevenue = totalRevenue - totalSupplierSales;

    const consignmentCommissions = suppliers.reduce((sum, s) => {
      return sum + (Number(s.total_sold || 0) * (Number(s.commission_rate || 0) / 100));
    }, 0);

    const myNetProfit = ownStockRevenue + consignmentCommissions;

    const owedToSuppliers = suppliers.reduce((sum, s) => {
      return sum + (Number(s.total_sold || 0) * (1 - Number(s.commission_rate || 0) / 100));
    }, 0);

    console.log(`\n1️⃣  TOTAL REVENUE:          RWF ${totalRevenue.toLocaleString()}`);
    console.log(`    (Only paid orders)`);

    console.log(`\n2️⃣  MY NET PROFIT:          RWF ${myNetProfit.toLocaleString()}`);
    console.log(`    = Own Stock Revenue:   RWF ${ownStockRevenue.toLocaleString()}`);
    console.log(`    + Commissions:         RWF ${consignmentCommissions.toLocaleString()}`);

    console.log(`\n3️⃣  OWED TO SUPPLIERS:     RWF ${owedToSuppliers.toLocaleString()}`);
    console.log(`    (Must pay to ${suppliers.length} suppliers)`);

    console.log(`\n4️⃣  REVENUE BREAKDOWN:`);
    console.log(`    Own Stock:    RWF ${ownStockRevenue.toLocaleString()} (${((ownStockRevenue/totalRevenue)*100).toFixed(1)}%)`);
    console.log(`    Consignment:  RWF ${totalSupplierSales.toLocaleString()} (${((totalSupplierSales/totalRevenue)*100).toFixed(1)}%)`);

    console.log(`\n✅ VERIFICATION:`);
    console.log(`    Total Revenue:     RWF ${totalRevenue.toLocaleString()}`);
    console.log(`    Your Net Profit:   RWF ${myNetProfit.toLocaleString()} (${((myNetProfit/totalRevenue)*100).toFixed(1)}%)`);
    console.log(`    Supplier Payments: RWF ${owedToSuppliers.toLocaleString()} (${((owedToSuppliers/totalRevenue)*100).toFixed(1)}%)`);
    console.log(`    Total Accounted:   RWF ${(myNetProfit + owedToSuppliers).toLocaleString()}`);

    const diff = totalRevenue - (myNetProfit + owedToSuppliers);
    if (Math.abs(diff) < 1) {
      console.log(`    ✅ Math checks out! (diff: RWF ${diff.toFixed(2)})`);
    } else {
      console.log(`    ⚠️ Math error: RWF ${diff.toLocaleString()} difference`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Audit Complete\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}
