import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://fdsaemjngaamvgjlooyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2FlbWpuZ2FhbXZnamxvb3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3NjcsImV4cCI6MjA5MjU1ODc2N30.zFgCoZs4R_gT5cGiQA2WLn9fUuzIcogUkWOy3A1WtwI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) console.error(error);
    else console.log(Object.keys(data[0] || {}));
}
check();
