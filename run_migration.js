import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS receipt_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS receipt_confirmed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_receipt_confirmed
ON orders(receipt_confirmed)
WHERE receipt_confirmed = true;
`;

async function runMigration() {
  try {
    console.log('Running migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('Added columns:');
    console.log('  - receipt_confirmed (BOOLEAN, default false)');
    console.log('  - receipt_confirmed_at (TIMESTAMPTZ)');
    console.log('  - Index: idx_orders_receipt_confirmed');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

runMigration();
