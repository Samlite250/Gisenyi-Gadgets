import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkReviewsSchema() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Reviews columns:', Object.keys(data[0]));
  } else {
    console.log('Table is empty, trying to find schema via another way...');
    // Maybe try to insert a dummy and see error?
    const { error: insErr } = await supabase.from('reviews').insert({ id: '00000000-0000-0000-0000-000000000000' });
    console.log('Insert error hints:', insErr?.message);
  }
}

checkReviewsSchema();
