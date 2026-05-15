import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOrdersColumns() {
  const { data, error } = await supabase.from('orders').select('*').limit(1).single();
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Orders columns:', Object.keys(data));
  }
}

checkOrdersColumns();
