const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fdsaemjngaamvgjlooyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2FlbWpuZ2FhbXZnamxvb3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3NjcsImV4cCI6MjA5MjU1ODc2N30.zFgCoZs4R_gT5cGiQA2WLn9fUuzIcogUkWOy3A1WtwI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
  console.log('Attempting to create a Pro Demo account...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@gisenyi.com',
    password: 'password123',
    options: {
      data: { full_name: 'Gisenyi Admin' }
    }
  });

  if (error) {
    console.error('❌ Error creating user:', error.message);
  } else {
    console.log('✅ Account created successfully!');
    console.log('Email: admin@gisenyi.com');
    console.log('Password: password123');
  }
}

createUser();
