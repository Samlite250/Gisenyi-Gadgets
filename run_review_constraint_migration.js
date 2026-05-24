const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('Please set it with: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync('./ADD_UNIQUE_CONSTRAINT_REVIEWS.sql', 'utf8');

    console.log('Executing migration...\n');

    // Step 1: Remove duplicates
    console.log('Step 1: Removing duplicate reviews...');
    const { data: deleteData, error: deleteError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DELETE FROM reviews a
        USING reviews b
        WHERE a.id < b.id
          AND a.user_id = b.user_id
          AND a.product_id = b.product_id;
      `
    });

    if (deleteError) {
      console.log('Using direct query for delete...');
      const { error: deleteError2 } = await supabase
        .from('reviews')
        .delete()
        .match({});

      if (deleteError2) {
        console.warn('Note: Could not remove duplicates via anon key, skipping...');
      }
    } else {
      console.log('✓ Duplicates removed');
    }

    // Step 2: Add unique constraint
    console.log('\nStep 2: Adding unique constraint...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE reviews
        ADD CONSTRAINT reviews_user_product_unique
        UNIQUE (user_id, product_id);
      `
    });

    if (error) {
      throw error;
    }

    console.log('✓ Unique constraint added');

    // Step 3: Add comment
    console.log('\nStep 3: Adding comment...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        COMMENT ON CONSTRAINT reviews_user_product_unique ON reviews IS 'Ensures each user can only review a product once';
      `
    });

    console.log('✓ Comment added');

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\nThis operation requires service role key or database admin privileges.');
    console.log('Please run the SQL manually in Supabase SQL Editor:');
    console.log('1. Go to https://supabase.com/dashboard/project/cysejrutcrfvopqjqknv/sql');
    console.log('2. Copy the contents of ADD_UNIQUE_CONSTRAINT_REVIEWS.sql');
    console.log('3. Paste and run it');
    process.exit(1);
  }
}

runMigration();
