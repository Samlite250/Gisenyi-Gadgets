import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdsaemjngaamvgjlooyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2FlbWpuZ2FhbXZnamxvb3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3NjcsImV4cCI6MjA5MjU1ODc2N30.zFgCoZs4R_gT5cGiQA2WLn9fUuzIcogUkWOy3A1WtwI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('🌱 Starting database seeding with error logging...');

    const profiles = [
        { id: '00000000-0000-0000-0000-000000000001', full_name: 'Samuel Niyomugabo', phone: '+250788111222', role: 'customer', city: 'Gisenyi', is_active: true },
        { id: '00000000-0000-0000-0000-000000000002', full_name: 'Amelia Uwase', phone: '+250788333444', role: 'vendor', city: 'Kigali', is_active: true },
        { id: '00000000-0000-0000-0000-000000000003', full_name: 'Jean Baptiste', phone: '+250788555666', role: 'customer', city: 'Musanze', is_active: true },
        { id: '00000000-0000-0000-0000-000000000004', full_name: 'Grace Mutoni', phone: '+250788777888', role: 'customer', city: 'Huye', is_active: true },
        { id: '00000000-0000-0000-0000-000000000005', full_name: 'Eric Habimana', phone: '+250788999000', role: 'vendor', city: 'Rubavu', is_active: true },
    ];

    for (const p of profiles) {
        const { error } = await supabase.from('profiles').upsert(p);
        if (error) console.error(`❌ Profile ${p.id} failed:`, error.message);
        else console.log(`✅ Profile ${p.id} OK`);
    }

    const vendors = [
        { id: 'v1', profile_id: '00000000-0000-0000-0000-000000000002', shop_name: 'Amelia Mobile Shop', is_active: true, is_verified: true },
        { id: 'v2', profile_id: '00000000-0000-0000-0000-000000000005', shop_name: 'Eric Tech Garage', is_active: true, is_verified: true },
    ];

    for (const v of vendors) {
        const { error } = await supabase.from('vendors').upsert(v);
        if (error) console.error(`❌ Vendor ${v.id} failed:`, error.message);
        else console.log(`✅ Vendor ${v.id} OK`);
    }

    const products = [
        { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 850000, stock: 12, is_active: true, is_featured: true, vendor_id: 'v1', description: 'The ultimate AI phone.' },
        { name: 'iPhone 15 Pro Max', brand: 'Apple', price: 1200000, stock: 8, is_active: true, is_featured: true, vendor_id: 'v1', description: 'Titanium design, A17 Pro chip.' },
        { name: 'AirPods Pro (3rd Gen)', brand: 'Apple', price: 120000, stock: 25, is_active: true, is_featured: false, vendor_id: 'v1', description: 'Pro-level noise cancellation.' },
        { name: 'MacBook Air M3', brand: 'Apple', price: 1450000, stock: 5, is_active: true, is_featured: true, vendor_id: 'v1', description: 'Strikingly thin, fast, and light.' },
        { name: 'Sony WH-1000XM5', brand: 'Sony', price: 195000, stock: 18, is_active: true, is_featured: false, vendor_id: 'v2', description: 'The best noise cancelling headphones.' },
    ];

    for (const pr of products) {
        const { error } = await supabase.from('products').upsert(pr);
        if (error) console.error(`❌ Product ${pr.name} failed:`, error.message);
        else console.log(`✅ Product ${pr.name} OK`);
    }

    const orders = [
        { order_number: 'GGS-1001', profile_id: '00000000-0000-0000-0000-000000000001', total: 850000, status: 'delivered', payment_status: 'paid', payment_method: 'momo' },
        { order_number: 'GGS-1002', profile_id: '00000000-0000-0000-0000-000000000003', total: 1200000, status: 'shipped', payment_status: 'paid', payment_method: 'card' },
        { order_number: 'GGS-1003', profile_id: '00000000-0000-0000-0000-000000000004', total: 120000, status: 'pending', payment_status: 'unpaid', payment_method: 'cash' },
        { order_number: 'GGS-1004', profile_id: '00000000-0000-0000-0000-000000000001', total: 1450000, status: 'processing', payment_status: 'paid', payment_method: 'momo' },
        { order_number: 'GGS-1005', profile_id: '00000000-0000-0000-0000-000000000003', total: 195000, status: 'cancelled', payment_status: 'refunded', payment_method: 'card' },
    ];

    for (const o of orders) {
        const { error } = await supabase.from('orders').upsert(o);
        if (error) console.error(`❌ Order ${o.order_number} failed:`, error.message);
        else console.log(`✅ Order ${o.order_number} OK`);
    }

    console.log('✨ Finished check.');
}

seed();
