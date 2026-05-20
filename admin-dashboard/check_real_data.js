// Database Data Verification Script
// Run this to see what's actually in your database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabase() {
  console.log('\n🔍 GISENYI GADGETS - DATABASE AUDIT\n');
  console.log('='.repeat(60));

  try {
    // 1. Check Orders
    console.log('\n📦 ORDERS TABLE:');
    const { data: orders, count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

    console.log(`Total Orders: ${orderCount}`);

    if (orders && orders.length > 0) {
      const paidOrders = orders.filter(o => o.payment_status === 'paid');
      const unpaidOrders = orders.filter(o => o.payment_status !== 'paid');

      console.log(`  - Paid Orders: ${paidOrders.length}`);
      console.log(`  - Unpaid Orders: ${unpaidOrders.length}`);

      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
      console.log(`  - Total Revenue (paid): RWF ${totalRevenue.toLocaleString()}`);

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

    console.log(`Total Suppliers: ${supplierCount}`);

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
      console.log(`  - Total Owed: RWF ${totalOwed.toLocaleString()}`);
      console.log(`  - Total Commissions: RWF ${totalCommissions.toLocaleString()}`);

      console.log('\n  Supplier Details:');
      suppliers.forEach(s => {
        console.log(`    ${s.name}: RWF ${Number(s.total_sold || 0).toLocaleString()} sold @ ${s.commission_rate}% commission`);
      });
    } else {
      console.log('  ⚠️ No suppliers in database');
    }

    // 3. Check Products
    console.log('\n📱 PRODUCTS TABLE:');
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`Total Active Products: ${productCount}`);

    // 4. Check Users
    console.log('\n👥 USERS TABLE:');
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    console.log(`Total Customers: ${userCount}`);

    // 5. Calculate Financial Metrics
    console.log('\n💰 CALCULATED FINANCIAL METRICS:');
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

      console.log(`Total Revenue:          RWF ${totalRevenue.toLocaleString()}`);
      console.log(`Own Stock Revenue:      RWF ${ownStockRevenue.toLocaleString()}`);
      console.log(`Consignment Sales:      RWF ${totalSupplierSales.toLocaleString()}`);
      console.log(`Consignment Commissions: RWF ${consignmentCommissions.toLocaleString()}`);
      console.log(`My Net Profit:          RWF ${myNetProfit.toLocaleString()}`);
      console.log(`Owed To Suppliers:      RWF ${owedToSuppliers.toLocaleString()}`);

      console.log('\n📊 BREAKDOWN:');
      console.log(`  Your Money: RWF ${myNetProfit.toLocaleString()} (${((myNetProfit/totalRevenue)*100).toFixed(1)}%)`);
      console.log(`  Supplier Money: RWF ${owedToSuppliers.toLocaleString()} (${((owedToSuppliers/totalRevenue)*100).toFixed(1)}%)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Audit Complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
