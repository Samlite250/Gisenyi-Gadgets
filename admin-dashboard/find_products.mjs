import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function findProducts() {
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, supplier_id, categories(name)')
    .is('supplier_id', null)
    .order('price', { ascending: false })
    .limit(10);

  console.log('\n📦 Available Products (not assigned to supplier):\n');
  products?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Price: RWF ${Number(p.price).toLocaleString()}`);
    console.log(`   Category: ${p.categories?.name || 'Unknown'}`);
    console.log(`   ID: ${p.id}\n`);
  });
}

findProducts();
