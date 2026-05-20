import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function setupLaptop() {
  console.log('\n🔧 SETTING UP SUPPLIER LAPTOP\n');
  console.log('='.repeat(60));

  // Get Marie Claire (20% commission)
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('name', 'Marie Claire Uwimana')
    .single();

  console.log(`\n✅ Supplier: ${supplier.name}`);
  console.log(`   Commission Rate: ${supplier.commission_rate}%`);

  // Use the Asus ROG laptop (originally RWF 1,800,000)
  const laptopId = 'fa98056c-4700-453c-9b9a-ae963dae3c71';

  // Update to RWF 500,000 and assign to Marie Claire
  const { data: updated, error } = await supabase
    .from('products')
    .update({
      supplier_id: supplier.id,
      price: 500000,
    })
    .eq('id', laptopId)
    .select('*, categories(name)')
    .single();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('\n✅ LAPTOP CONFIGURED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`\n📦 Product Details:`);
  console.log(`   Name: ${updated.name}`);
  console.log(`   Category: ${updated.categories?.name}`);
  console.log(`   Selling Price: RWF ${Number(updated.price).toLocaleString()}`);
  console.log(`   Supplier: ${supplier.name}`);
  
  console.log(`\n💰 Commission Breakdown:`);
  const commission = 500000 * (supplier.commission_rate / 100);
  const supplierAmount = 500000 - commission;
  
  console.log(`   Commission Rate: ${supplier.commission_rate}%`);
  console.log(`   Your Income Per Sale: RWF ${commission.toLocaleString()}`);
  console.log(`   Amount to Supplier: RWF ${supplierAmount.toLocaleString()}`);

  console.log(`\n📊 How It Works:`);
  console.log(`   1. Customer buys laptop for RWF 500,000`);
  console.log(`   2. You keep RWF ${commission.toLocaleString()} (${supplier.commission_rate}% commission)`);
  console.log(`   3. You pay RWF ${supplierAmount.toLocaleString()} to ${supplier.name}`);
  console.log(`   4. Your profit: RWF ${commission.toLocaleString()}`);

  console.log(`\n✨ Next Steps:`);
  console.log(`   1. Open dashboard: https://gisenyicpanel.vercel.app/suppliers`);
  console.log(`   2. Click "View" button on Marie Claire Uwimana`);
  console.log(`   3. You'll see "${updated.name}" listed with full breakdown!`);
  console.log(`\n   When the laptop sells:`);
  console.log(`   • Go to Suppliers page`);
  console.log(`   • Click Edit on Marie Claire`);
  console.log(`   • Update "Total Sold" from RWF 0 to RWF 500,000`);
  console.log(`   • Dashboard will show your RWF ${commission.toLocaleString()} commission automatically!\n`);
}

setupLaptop();
