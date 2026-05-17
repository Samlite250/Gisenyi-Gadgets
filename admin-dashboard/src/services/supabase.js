import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ─── Dashboard stats ──────────────────────────────────────────
export const fetchDashboardStats = async () => {
  const [
    { count: totalOrders },
    { count: totalUsers },
    { count: totalProducts },
    { count: totalVendors },
    { data: recentOrders },
    { data: topProducts },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, profiles(full_name), total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id, name, price').order('created_at', { ascending: false }).limit(5),
  ]);

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid');

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  return { totalOrders, totalUsers, totalProducts, totalSuppliers: totalVendors, totalRevenue, recentOrders, topProducts };
};

// ─── Products CRUD ────────────────────────────────────────────
export const fetchProducts = async ({ page = 1, limit = 20, search = '', categoryId = null } = {}) => {
  let query = supabase
    .from('products')
    .select('*, categories(name), suppliers(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.ilike('name', `%${search}%`);
  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase.from('products').insert(productData).select().single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// ─── Orders CRUD ──────────────────────────────────────────────
export const fetchOrders = async ({ page = 1, limit = 20, status = null } = {}) => {
  let query = supabase
    .from('orders')
    .select('*, profiles(full_name, phone)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─── Users ────────────────────────────────────────────────────
export const fetchUsers = async ({ page = 1, limit = 20, search = '' } = {}) => {
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) query = query.ilike('full_name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

// ─── Suppliers ────────────────────────────────────────────────
export const fetchSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
