import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    INSERT INTO platform_settings (key, value) VALUES ('whatsapp_number', '"+250 788 000 000"') ON CONFLICT (key) DO NOTHING;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.log('RPC exec_sql failed (likely not enabled):', error.message);
    } else {
      console.log('Table created successfully via RPC.');
    }
  } catch (e) {
    console.log('Error calling RPC:', e.message);
  }
}

createTable();
