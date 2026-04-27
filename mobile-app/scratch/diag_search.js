const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('--- Database Diagnostic ---');

    // 1. Fetch all products
    const { data: all, error: allErr } = await supabase
        .from('products')
        .select('id, name, is_active, category_id');

    if (allErr) {
        console.error('Error fetching all products:', allErr.message);
    } else {
        console.log(`Total active/inactive products in DB: ${all.length}`);
        all.slice(0, 10).forEach(p => {
            console.log(`- ${p.name} (Active: ${p.is_active}, Cat: ${p.category_id})`);
        });
    }

    // 2. Test the specific search term "mackbook"
    const q = 'mackbook';
    console.log(`\nTesting search for: "${q}"`);
    const { data: search, error: searchErr } = await supabase
        .from('products')
        .select('name')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`);

    if (searchErr) {
        console.error('Search error:', searchErr.message);
    } else {
        console.log(`Found ${search.length} matches for "${q}"`);
        search.forEach(s => console.log(`- ${s.name}`));
    }

    // 3. Test for "macbook" (corrected spelling)
    const q2 = 'macbook';
    console.log(`\nTesting search for: "${q2}"`);
    const { data: search2 } = await supabase
        .from('products')
        .select('name')
        .or(`name.ilike.%${q2}%,description.ilike.%${q2}%`);

    console.log(`Found ${search2?.length || 0} matches for "${q2}"`);
    search2?.forEach(s => console.log(`- ${s.name}`));
}

checkProducts();
