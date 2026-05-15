import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSettingsTable() {
  console.log('Checking for platform_settings table...');
  const { error: checkError } = await supabase.from('platform_settings').select('*').limit(1);
  
  if (checkError && checkError.message.includes('relation "platform_settings" does not exist')) {
    console.log('Table does not exist. Please create it in the Supabase SQL Editor:');
    console.log(`
      CREATE TABLE platform_settings (
        key TEXT PRIMARY KEY,
        value JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      INSERT INTO platform_settings (key, value) VALUES ('whatsapp_number', '" +250 788 000 000"');
    `);
  } else {
    console.log('Table exists or other error:', checkError?.message);
  }
}

setupSettingsTable();
