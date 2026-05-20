import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function verify() {
  console.log('\n🔍 VERIFYING SUPPLIER SETUP\n');
  console.log('='.repeat(60));

  // Get Marie Claire
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', 'Marie Claire Uwimana')
    .single();

  console.log(`\n✅ Supplier: ${supplier.name}`);
  console.log(`   ID: ${supplier.id}`);
  console.log(`   Commission: ${supplier.commission_rate}%`);
  console.log(`   Total Sold: RWF ${Number(supplier.total_sold || 0).toLocaleString()}`);

  // Get products from this supplier
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, supplier_id, categories(name)')
    .eq('supplier_id', supplier.id);

  console.log(`\n📦 Products assigned to ${supplier.name}:`);
  if (products && products.length > 0) {
    products.forEach(p => {
      const commission = Number(p.price) * (supplier.commission_rate / 100);
      const supplierGets = Number(p.price) - commission;
      console.log(`\n   ✓ ${p.name}`);
      console.log(`     Price: RWF ${Number(p.price).toLocaleString()}`);
      console.log(`     Category: ${p.categories?.name}`);
      console.log(`     Your Income: RWF ${commission.toLocaleString()} (${supplier.commission_rate}%)`);
      console.log(`     Supplier Gets: RWF ${supplierGets.toLocaleString()}`);
    });
  } else {
    console.log('   ❌ No products found!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ NOW CHECK YOUR DASHBOARD:');
  console.log('   1. Open: https://gisenyicpanel.vercel.app/suppliers');
  console.log('   2. Click "View" on Marie Claire Uwimana');
  console.log('   3. You should see the laptop with full breakdown!\n');
}

verify();
