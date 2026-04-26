const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars['EXPO_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PRODUCTS = [
  // Smartphones (c1)
  { name: 'iPhone 15 Pro', price: 1200000, rating: '4.9', category_id: 'c1', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=300'] },
  { name: 'Samsung Galaxy S24 Ultra', price: 1300000, rating: '4.8', category_id: 'c1', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300'] },
  { name: 'Google Pixel 8 Pro', price: 950000, rating: '4.7', category_id: 'c1', is_active: true, images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=300'] },
  { name: 'OnePlus 12', price: 850000, rating: '4.6', category_id: 'c1', is_active: true, images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300'] },
  { name: 'Nothing Phone (2)', price: 650000, rating: '4.5', category_id: 'c1', is_active: true, images: ['https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=300'] },

  // Laptops (c2)
  { name: 'MacBook Pro M3 Max', price: 3500000, rating: '5.0', category_id: 'c2', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300'] },
  { name: 'Dell XPS 15', price: 2100000, rating: '4.8', category_id: 'c2', is_active: true, images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=300'] },
  { name: 'Razer Blade 16', price: 3200000, rating: '4.9', category_id: 'c2', is_active: true, images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=300'] },
  { name: 'Asus ROG Zephyrus G14', price: 1800000, rating: '4.7', category_id: 'c2', is_active: true, images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300'] },
  { name: 'HP Spectre x360', price: 1600000, rating: '4.6', category_id: 'c2', is_active: true, images: ['https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=300'] },

  // Headphones (c3)
  { name: 'Sony WH-1000XM5', price: 380000, rating: '4.9', category_id: 'c3', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300'] },
  { name: 'AirPods Max', price: 550000, rating: '4.7', category_id: 'c3', is_active: true, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300'] },
  { name: 'Bose QC Ultra', price: 420000, rating: '4.8', category_id: 'c3', is_active: true, images: ['https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=300'] },
  { name: 'Sennheiser Momentum 4', price: 350000, rating: '4.7', category_id: 'c3', is_active: true, images: ['https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=300'] },
  { name: 'Beats Studio Pro', price: 280000, rating: '4.5', category_id: 'c3', is_active: true, images: ['https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=300'] },

  // Smartwatches (c4)
  { name: 'Apple Watch Ultra 2', price: 850000, rating: '4.9', category_id: 'c4', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300'] },
  { name: 'Galaxy Watch 6 Classic', price: 350000, rating: '4.7', category_id: 'c4', is_active: true, images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=300'] },
  { name: 'Garmin Epix Gen 2', price: 950000, rating: '4.8', category_id: 'c4', is_active: true, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300'] },
  { name: 'Pixel Watch 2', price: 320000, rating: '4.6', category_id: 'c4', is_active: true, images: ['https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=300'] },
  { name: 'HUAWEI Watch GT 4', price: 250000, rating: '4.5', category_id: 'c4', is_active: true, images: ['https://images.unsplash.com/photo-1434493789847-2f02dc603507?q=80&w=300'] },

  // Tablets (c5)
  { name: 'iPad Pro 12.9" M2', price: 1200000, rating: '4.9', category_id: 'c5', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300'] },
  { name: 'Samsung Galaxy Tab S9 Ultra', price: 1100000, rating: '4.8', category_id: 'c5', is_active: true, images: ['https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=300'] },
  { name: 'Microsoft Surface Pro 9', price: 950000, rating: '4.7', category_id: 'c5', is_active: true, images: ['https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=300'] },
  { name: 'Xiaomi Pad 6 Pro', price: 450000, rating: '4.6', category_id: 'c5', is_active: true, images: ['https://images.unsplash.com/photo-1542751110-9764648393fb?q=80&w=300'] },
  { name: 'Lenovo Tab P12 Pro', price: 650000, rating: '4.5', category_id: 'c5', is_active: true, images: ['https://images.unsplash.com/photo-1527690789675-4ea7d8da4fe3?q=80&w=300'] },

  // Cameras (c6)
  { name: 'Sony A7 IV', price: 2500000, rating: '4.9', category_id: 'c6', is_featured: true, is_active: true, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=300'] },
  { name: 'Fujifilm X-T5', price: 1800000, rating: '4.8', category_id: 'c6', is_active: true, images: ['https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=300'] },
  { name: 'Canon EOS R6 Mark II', price: 2400000, rating: '4.9', category_id: 'c6', is_active: true, images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=300'] },
  { name: 'Nikon Z8', price: 4200000, rating: '5.0', category_id: 'c6', is_active: true, images: ['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300'] },
  { name: 'GoPro Hero 12', price: 450000, rating: '4.7', category_id: 'c6', is_active: true, images: ['https://images.unsplash.com/photo-1562184120-da3e884fbf34?q=80&w=300'] },
];

async function seed() {
  console.log('Seeding products...');
  
  // 1. Get Categories to map slugs to real IDs if needed
  // But our mobile app currently uses 'c1', 'c2' etc. mapping in its mock state.
  // In a real Supabase DB, category_id is usually a UUID.
  // Let's check what's in the categories table first.
  const { data: dbCategories, error: catError } = await supabase.from('categories').select('*');
  
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  
  console.log('Found categories in DB:', dbCategories.map(c => `${c.name} (${c.id})`));
  
  // Map our mock c1, c2 to real IDs
  const slugToId = {};
  dbCategories.forEach(c => {
    slugToId[c.slug] = c.id;
  });
  
  // Map c1 -> smartphones, c2 -> laptops etc based on DEMO_CATEGORIES logic
  const mockIdToSlug = {
    'c1': 'smartphones',
    'c2': 'laptops',
    'c3': 'headphones',
    'c4': 'smartwatches',
    'c5': 'tablets',
    'c6': 'cameras'
  };

  const finalProducts = PRODUCTS.map(p => {
    const slug = mockIdToSlug[p.category_id];
    const realId = slugToId[slug];
    return {
      ...p,
      category_id: realId || p.category_id // fallback to mock if cat not found
    };
  });

  const { data, error } = await supabase.from('products').insert(finalProducts);

  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded 30 products!');
  }
}

seed();
