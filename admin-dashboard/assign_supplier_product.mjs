import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function assignProduct() {
  console.log('\n=== ASSIGNING LAPTOP TO SUPPLIER ===\n');

  // Get Marie Claire (20% commission)
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', 'Marie Claire Uwimana')
    .single();

  if (!supplier) {
    console.log('❌ Supplier not found');
    return;
  }

  console.log(`✅ Found supplier: ${supplier.name}`);
  console.log(`   Commission: ${supplier.commission_rate}%`);

  // Check for existing laptop products
  const { data: laptops } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%laptop%')
    .limit(5);

  console.log(`\n📦 Found ${laptops?.length || 0} laptop products:`);
  laptops?.forEach(p => {
    console.log(`   • ${p.name} - RWF ${Number(p.price).toLocaleString()} (supplier_id: ${p.supplier_id || 'none'})`);
  });

  // Find a laptop to assign or use the first one
  let laptop = laptops?.[0];

  if (!laptop) {
    console.log('\n❌ No laptop products found. Please add a laptop product first.');
    return;
  }

  console.log(`\n🔧 Updating product: ${laptop.name}`);
  console.log(`   Setting price to: RWF 500,000`);
  console.log(`   Assigning to: ${supplier.name}`);

  // Update the laptop
  const { error } = await supabase
    .from('products')
    .update({
      supplier_id: supplier.id,
      price: 500000,
      cost: 500000, // Cost from supplier perspective
    })
    .eq('id', laptop.id);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('\n✅ SUCCESS!');
  console.log('='.repeat(60));
  console.log(`\nProduct: ${laptop.name}`);
  console.log(`Supplier: ${supplier.name}`);
  console.log(`Selling Price: RWF 500,000`);
  console.log(`Commission Rate: ${supplier.commission_rate}%`);
  console.log(`Your Income Per Sale: RWF ${(500000 * supplier.commission_rate / 100).toLocaleString()}`);
  console.log(`Amount to Supplier: RWF ${(500000 * (1 - supplier.commission_rate / 100)).toLocaleString()}`);
  console.log('\n📱 Now check the Suppliers page in your dashboard!');
  console.log('   Go to: https://gisenyicpanel.vercel.app/suppliers');
  console.log('   Click "View" on Marie Claire Uwimana');
  console.log('   You\'ll see the laptop listed with commission breakdown\n');
}

assignProduct();
