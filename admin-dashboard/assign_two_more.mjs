import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function assignTwoMore() {
  console.log('\n🔧 ASSIGNING TWO MORE PRODUCTS TO MARIE CLAIRE\n');
  console.log('='.repeat(60));

  // Get Marie Claire
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', 'Marie Claire Uwimana')
    .single();

  console.log(`\n✅ Supplier: ${supplier.name}`);
  console.log(`   Commission: ${supplier.commission_rate}%`);

  // Find products without suppliers
  const { data: available } = await supabase
    .from('products')
    .select('id, name, price, categories(name)')
    .is('supplier_id', null)
    .order('price', { ascending: false })
    .limit(10);

  console.log(`\n📦 Available products:\n`);
  available?.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - RWF ${Number(p.price).toLocaleString()} (${p.categories?.name})`);
  });

  // Let's pick two good products: a phone and a tablet/camera
  // iPhone 15 Pro Max and one more
  const productsToAssign = [
    '6a562aca-3740-43e7-aae8-1b01fb44b3af', // iPhone 15 Pro Max - RWF 1,450,000
    '4d7a075b-9090-41f1-98bd-cefb6e12413c'  // Sony Alpha A7 IV - RWF 2,500,000
  ];

  console.log(`\n🔄 Assigning products...\n`);

  const results = [];

  for (const productId of productsToAssign) {
    const { data: updated, error } = await supabase
      .from('products')
      .update({ supplier_id: supplier.id })
      .eq('id', productId)
      .select('*, categories(name)')
      .single();

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      const commission = Number(updated.price) * (supplier.commission_rate / 100);
      const supplierGets = Number(updated.price) - commission;
      
      results.push({
        name: updated.name,
        price: updated.price,
        category: updated.categories?.name,
        commission,
        supplierGets
      });

      console.log(`   ✓ ${updated.name}`);
      console.log(`     Price: RWF ${Number(updated.price).toLocaleString()}`);
      console.log(`     Category: ${updated.categories?.name}`);
      console.log(`     Your Income: RWF ${commission.toLocaleString()}`);
      console.log(`     Supplier Gets: RWF ${supplierGets.toLocaleString()}\n`);
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n✅ ASSIGNMENT COMPLETE!\n');
  
  const totalValue = results.reduce((sum, p) => sum + Number(p.price), 0);
  const totalCommission = results.reduce((sum, p) => sum + p.commission, 0);
  const totalSupplier = results.reduce((sum, p) => sum + p.supplierGets, 0);

  console.log('📊 Summary:');
  console.log(`   Products Assigned: ${results.length}`);
  console.log(`   Total Value: RWF ${totalValue.toLocaleString()}`);
  console.log(`   Your Income: RWF ${totalCommission.toLocaleString()} (${supplier.commission_rate}%)`);
  console.log(`   Supplier Gets: RWF ${totalSupplier.toLocaleString()}`);

  console.log('\n💡 Now Marie Claire has:');
  console.log('   1. Asus ROG Zephyrus G14 (Laptop) - RWF 500,000');
  results.forEach((p, i) => {
    console.log(`   ${i + 2}. ${p.name} (${p.category}) - RWF ${Number(p.price).toLocaleString()}`);
  });

  console.log('\n✨ View in dashboard:');
  console.log('   https://gisenyicpanel.vercel.app/suppliers');
  console.log('   Click "View" on Marie Claire Uwimana\n');
}

assignTwoMore();
