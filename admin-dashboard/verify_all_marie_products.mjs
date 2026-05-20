import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function verifyAll() {
  console.log('\n🔍 FINAL VERIFICATION - MARIE CLAIRE PRODUCTS\n');
  console.log('='.repeat(70));

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', 'Marie Claire Uwimana')
    .single();

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, categories(name)')
    .eq('supplier_id', supplier.id)
    .order('price', { ascending: false });

  console.log(`\n✅ Supplier: ${supplier.name}`);
  console.log(`   Commission Rate: ${supplier.commission_rate}%`);
  console.log(`   Total Products: ${products?.length || 0}\n`);

  let totalValue = 0;
  let totalCommission = 0;

  console.log('📦 Products:\n');
  products?.forEach((p, i) => {
    const price = Number(p.price);
    const commission = price * (supplier.commission_rate / 100);
    const supplierGets = price - commission;

    totalValue += price;
    totalCommission += commission;

    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Category: ${p.categories?.name}`);
    console.log(`   Price: RWF ${price.toLocaleString()}`);
    console.log(`   Your Income: RWF ${commission.toLocaleString()} (${supplier.commission_rate}%)`);
    console.log(`   Supplier Gets: RWF ${supplierGets.toLocaleString()}\n`);
  });

  console.log('='.repeat(70));
  console.log('\n💰 TOTALS (if all 3 products sell):');
  console.log(`   Total Sales Value: RWF ${totalValue.toLocaleString()}`);
  console.log(`   Your Total Income: RWF ${totalCommission.toLocaleString()}`);
  console.log(`   Pay to Supplier: RWF ${(totalValue - totalCommission).toLocaleString()}`);

  console.log('\n✨ View in Dashboard:');
  console.log('   1. Open: https://gisenyicpanel.vercel.app/suppliers');
  console.log('   2. Click "View" on Marie Claire Uwimana');
  console.log('   3. See all 3 products with income breakdown!');
  console.log('\n   Hard refresh (Ctrl+Shift+R) if you don\'t see changes.\n');
}

verifyAll();
