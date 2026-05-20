import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cysejrutcrfvopqjqknv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8'
);

async function checkSupplierProducts() {
  const { data: suppliers } = await supabase.from('suppliers').select('id, name');
  console.log('\n=== SUPPLIERS ===');
  console.log(JSON.stringify(suppliers, null, 2));

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, cost, supplier_id, category_id, categories(name)')
    .not('supplier_id', 'is', null)
    .limit(5);
  
  console.log('\n=== SAMPLE SUPPLIER PRODUCTS ===');
  console.log(JSON.stringify(products, null, 2));
}

checkSupplierProducts();
