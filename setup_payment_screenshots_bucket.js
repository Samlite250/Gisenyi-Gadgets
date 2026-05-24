/**
 * Setup Payment Screenshots Storage Bucket
 * Run: node setup_payment_screenshots_bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPaymentScreenshotsBucket() {
  console.log('🚀 Setting up payment-screenshots storage bucket...\n');

  try {
    // Read the migration SQL
    const migrationPath = join(__dirname, 'supabase', 'migrations', '007_payment_screenshots_bucket.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: 007_payment_screenshots_bucket.sql');

    // Execute the SQL (note: this requires service_role key for full SQL access)
    // For now, we'll use the Supabase client to create the bucket
    console.log('⚠️  Note: Please run this SQL in your Supabase SQL Editor:');
    console.log('   Dashboard → SQL Editor → New Query → Paste the SQL from:');
    console.log(`   ${migrationPath}\n`);

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const bucketExists = buckets.some(b => b.id === 'payment-screenshots');

    if (bucketExists) {
      console.log('✅ payment-screenshots bucket already exists');
    } else {
      console.log('⚠️  payment-screenshots bucket does NOT exist');
      console.log('   Please run the migration SQL in Supabase Dashboard');
    }

    console.log('\n📝 Instructions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new');
    console.log('2. Copy the contents of: supabase/migrations/007_payment_screenshots_bucket.sql');
    console.log('3. Paste and run in the SQL Editor');
    console.log('4. Verify in: Storage → Buckets → payment-screenshots should appear\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupPaymentScreenshotsBucket();
