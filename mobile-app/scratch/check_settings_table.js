import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  // We can't directly list tables via anon key easily, but we can try to guess some names or check if platform_settings exists
  const { error } = await supabase.from('platform_settings').select('*').limit(1);
  if (error && error.message.includes('not found')) {
    console.log('Error: platform_settings table does not exist.');
  } else if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Success: platform_settings exists.');
  }
}

listTables();
