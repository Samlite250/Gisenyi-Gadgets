import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function checkDetails() {
  console.log('\n=== CHECKING SUPPLIER PRODUCTS ===\n');
  
  const { data: suppliers } = await supabase.from('suppliers').select('*');
  
  for (const s of suppliers || []) {
    console.log(`\n📦 ${s.name}`);
    console.log(`   Commission: ${s.commission_rate}%`);
    console.log(`   Total Sold: RWF ${Number(s.total_sold || 0).toLocaleString()}`);
    
    // Get products from this supplier
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, cost, category_id, categories(name)')
      .eq('supplier_id', s.id);
    
    console.log(`   Products: ${products?.length || 0}`);
    if (products && products.length > 0) {
      products.slice(0, 3).forEach(p => {
        const profit = Number(p.price || 0) - Number(p.cost || 0);
        const commission = Number(p.price || 0) * (s.commission_rate / 100);
        console.log(`     • ${p.name}`);
        console.log(`       Price: RWF ${Number(p.price).toLocaleString()} | Cost: RWF ${Number(p.cost || 0).toLocaleString()}`);
        console.log(`       Category: ${p.categories?.name || 'Unknown'}`);
        console.log(`       Your Cut: RWF ${commission.toLocaleString()}`);
      });
      if (products.length > 3) {
        console.log(`     ... and ${products.length - 3} more`);
      }
    }
  }
}

checkDetails();
