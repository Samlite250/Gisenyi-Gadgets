import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // You need service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  // Create products bucket if it doesn't exist
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const productsBucket = buckets.find(b => b.name === 'products');
  
  if (!productsBucket) {
    console.log('Creating products bucket...');
    const { data, error } = await supabase.storage.createBucket('products', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/*']
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('✅ Products bucket created successfully!');
    }
  } else {
    console.log('✅ Products bucket already exists');
  }
}

setupStorage();
