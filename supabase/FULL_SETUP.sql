-- ============================================================
-- GISENYI GADGETS — FULL DATABASE SETUP
-- Paste this entire file into Supabase SQL Editor and run once.
-- This sets up all tables, RLS, storage, seed data, and admin user.
-- ============================================================

-- ─── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── CLEANUP (safe re-run) ────────────────────────────────────
DROP TABLE IF EXISTS public.chat_messages    CASCADE;
DROP TABLE IF EXISTS public.notifications    CASCADE;
DROP TABLE IF EXISTS public.wishlists        CASCADE;
DROP TABLE IF EXISTS public.reviews          CASCADE;
DROP TABLE IF EXISTS public.order_items      CASCADE;
DROP TABLE IF EXISTS public.orders           CASCADE;
DROP TABLE IF EXISTS public.products         CASCADE;
DROP TABLE IF EXISTS public.categories       CASCADE;
DROP TABLE IF EXISTS public.banners          CASCADE;
DROP TABLE IF EXISTS public.promo_codes      CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;
DROP TABLE IF EXISTS public.suppliers        CASCADE;
DROP TABLE IF EXISTS public.vendors          CASCADE;
DROP TABLE IF EXISTS public.profiles         CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()  CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at()   CASCADE;

-- ══════════════════════════════════════════════════════════════
-- TABLES
-- ══════════════════════════════════════════════════════════════

-- ─── PROFILES ─────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  address       TEXT,
  city          TEXT DEFAULT 'Gisenyi',
  country       TEXT DEFAULT 'Rwanda',
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SUPPLIERS ────────────────────────────────────────────────
CREATE TABLE public.suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  business_name   TEXT,
  location        TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 15,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  products_count  INTEGER DEFAULT 0,
  total_sold      NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── VENDORS ──────────────────────────────────────────────────
CREATE TABLE public.vendors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_name       TEXT NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  banner_url      TEXT,
  phone           TEXT,
  email           TEXT,
  location        TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  rating          NUMERIC(2,1) DEFAULT 0,
  total_sales     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Smartphones',  'smartphones',  '📱', 1),
  ('Laptops',      'laptops',      '💻', 2),
  ('Headphones',   'headphones',   '🎧', 3),
  ('Smartwatches', 'smartwatches', '⌚', 4),
  ('Tablets',      'tablets',      '📟', 5),
  ('Cameras',      'cameras',      '📷', 6),
  ('Accessories',  'accessories',  '🔌', 7),
  ('Gaming',       'gaming',       '🎮', 8);

-- ─── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID REFERENCES public.vendors(id)    ON DELETE SET NULL,
  supplier_id     UUID REFERENCES public.suppliers(id)  ON DELETE SET NULL,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_price   NUMERIC(12,2),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images          TEXT[] DEFAULT '{}',
  colors          TEXT[] DEFAULT '{}',
  storage_options TEXT[] DEFAULT '{}',
  brand           TEXT,
  sku             TEXT UNIQUE,
  rating          NUMERIC(2,1) DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDERS ───────────────────────────────────────────────────
CREATE TABLE public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT NOT NULL UNIQUE DEFAULT ('GGS' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method    TEXT CHECK (payment_method IN ('momo', 'mtn', 'airtel', 'bank', 'crypto', 'card', 'cash')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_address  JSONB,
  notes             TEXT,
  estimated_delivery DATE,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE public.order_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES public.orders(id)   ON DELETE CASCADE,
  product_id       UUID REFERENCES public.products(id)          ON DELETE SET NULL,
  vendor_id        UUID REFERENCES public.vendors(id)           ON DELETE SET NULL,
  product_name     TEXT NOT NULL,
  product_image    TEXT,
  price            NUMERIC(12,2) NOT NULL,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  selected_color   TEXT,
  selected_storage TEXT,
  subtotal         NUMERIC(12,2) GENERATED ALWAYS AS (price * quantity) STORED
);

-- ─── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES public.orders(id)            ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  image_url   TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id, order_id)
);

-- ─── WISHLISTS ─────────────────────────────────────────────────
CREATE TABLE public.wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT DEFAULT 'general' CHECK (type IN ('order', 'promo', 'system', 'general')),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHAT MESSAGES ─────────────────────────────────────────────
CREATE TABLE public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  reactions   JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BANNERS ──────────────────────────────────────────────────
CREATE TABLE public.banners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          TEXT NOT NULL DEFAULT 'banner' CHECK (type IN ('banner', 'offer')),
  title         TEXT,
  subtitle      TEXT,
  button_text   TEXT DEFAULT 'Shop Now',
  discount      TEXT,
  label         TEXT,
  tagline       TEXT,
  color         TEXT DEFAULT '#1E293B',
  image_url     TEXT,
  link_category TEXT,
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROMO CODES ──────────────────────────────────────────────
CREATE TABLE public.promo_codes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code           TEXT NOT NULL UNIQUE,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  max_uses       INTEGER,
  uses_count     INTEGER NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PLATFORM SETTINGS ────────────────────────────────────────
CREATE TABLE public.platform_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGERS
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_vendors_updated_at   BEFORE UPDATE ON public.vendors    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_products_updated_at  BEFORE UPDATE ON public.products   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at    BEFORE UPDATE ON public.orders     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_own_read"   ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"  ON public.profiles USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Categories
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_all_access"  ON public.categories USING (true) WITH CHECK (true);

-- Products
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "products_all_access"  ON public.products USING (true) WITH CHECK (true);

-- Suppliers
CREATE POLICY "suppliers_all_access" ON public.suppliers USING (true) WITH CHECK (true);

-- Vendors
CREATE POLICY "vendors_public_read" ON public.vendors FOR SELECT USING (is_active = true);
CREATE POLICY "vendors_all_access"  ON public.vendors USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "orders_own_read"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_all_access" ON public.orders USING (true) WITH CHECK (true);

-- Order Items
CREATE POLICY "order_items_own_read"   ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "order_items_own_insert" ON public.order_items FOR INSERT WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "order_items_all_access" ON public.order_items USING (true) WITH CHECK (true);

-- Reviews
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_update"  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Wishlists
CREATE POLICY "wishlists_own_read"   ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlists_own_insert" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlists_own_delete" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "notifications_own_read"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_admin_all"  ON public.notifications USING (true) WITH CHECK (true);

-- Chat Messages
CREATE POLICY "chat_own_read"   ON public.chat_messages FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "chat_own_insert" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "chat_update"     ON public.chat_messages FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Banners
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "banners_all_access"  ON public.banners USING (true) WITH CHECK (true);

-- Promo Codes
CREATE POLICY "promo_public_read" ON public.promo_codes FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "promo_admin_all"   ON public.promo_codes USING (true) WITH CHECK (true);

-- Platform Settings
CREATE POLICY "platform_settings_public_read" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "platform_settings_admin_all"   ON public.platform_settings USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════
CREATE INDEX idx_products_category   ON public.products(category_id);
CREATE INDEX idx_products_featured   ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_orders_user         ON public.orders(user_id);
CREATE INDEX idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX idx_reviews_product     ON public.reviews(product_id);
CREATE INDEX idx_wishlists_user      ON public.wishlists(user_id);
CREATE INDEX idx_notifications_user  ON public.notifications(user_id, is_read);
CREATE INDEX idx_chat_user           ON public.chat_messages(user_id, created_at);

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('review-images', 'review-images', true, 3145728, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "product_images_read"   ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

CREATE POLICY "avatars_read"   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "review_images_read"   ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
CREATE POLICY "review_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-images');

-- ══════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════

-- Banners
INSERT INTO public.banners (type, title, subtitle, button_text, color, image_url, sort_order) VALUES
  ('banner', 'Big Sale Up to'||chr(10)||'40% OFF',   'On all electronics', 'Shop Now',   '#1E293B', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300', 1),
  ('banner', 'Apple Days'||chr(10)||'Save RWF 200K', 'MacBooks & iPads',   'Explore',    '#475569', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300', 2),
  ('banner', 'Smart Wear'||chr(10)||'Trending',      'Upgrade your style', 'View Deals', '#64748B', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300', 3);

INSERT INTO public.banners (type, label, discount, tagline, color, image_url, link_category, sort_order) VALUES
  ('offer', 'Smartphones',  '30% OFF', 'Top picks this week',     '#3B82F6', 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600', 'smartphones',  1),
  ('offer', 'Laptops',      '20% OFF', 'Work smarter, save more', '#0EA5E9', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600', 'laptops',      2),
  ('offer', 'Headphones',   '40% OFF', 'Sound deals today',       '#0891B2', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600', 'headphones',   3),
  ('offer', 'Smartwatches', '25% OFF', 'Style meets tech',        '#10B981', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600', 'smartwatches', 4),
  ('offer', 'Cameras',      '15% OFF', 'Capture every moment',    '#F59E0B', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600', 'cameras',      5);

-- Promo Codes
INSERT INTO public.promo_codes (code, discount_type, discount_value, is_active) VALUES
  ('GADGET10',  'percent', 10,   true),
  ('WELCOME20', 'percent', 20,   true),
  ('GISENYI',   'fixed',   5000, true)
ON CONFLICT (code) DO NOTHING;

-- Platform Settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('platformName',          '"Gisenyi Gadgets"'),
  ('currency',              '"RWF"'),
  ('supportEmail',          '"support@gisenyigadgets.rw"'),
  ('whatsapp_number',       '"+250788000000"'),
  ('mtnNumber',             '"+250781000000"'),
  ('airtelNumber',          '"+250731000000"'),
  ('standardShippingFee',   '"2000"'),
  ('expressShippingFee',    '"5000"'),
  ('freeShippingThreshold', '"50000"'),
  ('lowStockThreshold',     '"5"')
ON CONFLICT (key) DO NOTHING;

-- Suppliers
INSERT INTO public.suppliers (name, phone, business_name, location, commission_rate, notes)
VALUES
  ('Jean-Pierre Habimana', '+250 788 123 456', 'JP Electronics', 'Gisenyi Market', 15, 'Supplies iPhones and Samsung phones.'),
  ('Marie Claire Uwimana', '+250 788 234 567', 'MC Tech Store',  'Rubavu',         20, 'Laptops and tablets.')
ON CONFLICT DO NOTHING;

-- Products — Smartphones
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('iPhone 15 Pro Max',        'Titanium design, A17 Pro chip, 48MP camera, USB-C, Action Button.',           1450000, 1600000, 12, ARRAY['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=600','https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600'], 'Apple',   4.9, 215, true),
  ('Samsung Galaxy S24 Ultra', '6.8" QHD+ display, 200MP camera, S Pen, Snapdragon 8 Gen 3.',                1300000, 1450000, 8,  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600','https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600'], 'Samsung', 4.8, 187, true),
  ('Google Pixel 8 Pro',       '6.7" LTPO OLED, Tensor G3, 50MP triple camera, 7 years of updates.',         950000,  null,    15, ARRAY['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600','https://images.unsplash.com/photo-1611604548018-d56bbd85d681?q=80&w=600'], 'Google',  4.7, 98,  false),
  ('OnePlus 12',               '6.82" LTPO3 AMOLED, Snapdragon 8 Gen 3, 100W SuperVOOC charging.',           850000,  950000,  20, ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=600'], 'OnePlus', 4.6, 76,  false),
  ('Xiaomi 14 Ultra',          'Leica 1-inch main sensor, 6.73" LTPO AMOLED, Snapdragon 8 Gen 3.',           1100000, 1200000, 10, ARRAY['https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600'], 'Xiaomi',  4.7, 54,  false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'smartphones';

-- Products — Laptops
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('MacBook Pro M3 Max',     '16-inch Liquid Retina XDR, M3 Max chip, 36GB RAM, 1TB SSD.',              3500000, 3800000, 5,  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600','https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600'], 'Apple',   5.0, 89,  true),
  ('Dell XPS 15 OLED',       '15.6" 3.5K OLED, Core i9-13900H, RTX 4070, 32GB RAM.',                   2100000, 2300000, 7,  ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600','https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600'], 'Dell',    4.8, 65,  true),
  ('Asus ROG Zephyrus G14',  '14" QHD+ 165Hz, Ryzen 9, RTX 4060, 16GB DDR5.',                          1800000, null,    10, ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600','https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600'], 'Asus',    4.7, 112, false),
  ('HP Spectre x360 14',     '14" 2.8K OLED touch, Intel Evo i7, 32GB RAM, 360° hinge.',               1600000, 1750000, 12, ARRAY['https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=600','https://images.unsplash.com/photo-1589561253898-768105ca91a8?q=80&w=600'], 'HP',      4.6, 58,  false),
  ('Lenovo Legion 5i Pro',   '16" QHD 240Hz, Core i7-13700HX, RTX 4070, 32GB RAM.',                    1900000, 2100000, 8,  ARRAY['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600','https://images.unsplash.com/photo-1537498425277-c23e922af812?q=80&w=600'], 'Lenovo',  4.8, 143, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'laptops';

-- Products — Headphones
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Sony WH-1000XM5',         'Industry-leading ANC, 30hr battery, Multipoint, Speak-to-Chat.',    380000, 450000, 25, ARRAY['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600','https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600'], 'Sony',       4.9, 320, true),
  ('AirPods Pro (3rd Gen)',   'ANC, Transparency mode, Adaptive Audio, H2 chip, 30hr total.',       320000, 360000, 30, ARRAY['https://images.unsplash.com/photo-1588423771073-b8903fead2eb?q=80&w=600','https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=600'], 'Apple',      4.8, 445, true),
  ('Bose QuietComfort Ultra', 'World-class ANC, Immersive Audio, CustomTune, 24hr battery.',        420000, null,   18, ARRAY['https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=600','https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600'], 'Bose',       4.8, 178, false),
  ('Sennheiser Momentum 4',   'Adaptive ANC, 60hr playtime, foldable, touch controls.',             350000, 400000, 15, ARRAY['https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600','https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600'], 'Sennheiser', 4.7, 96,  false),
  ('Beats Studio Pro',        'Spatial Audio, ANC, USB-C & 3.5mm, 40hr battery.',                   280000, 320000, 22, ARRAY['https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=600','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600'], 'Beats',      4.5, 201, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'headphones';

-- Products — Smartwatches
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Apple Watch Ultra 2',           'Titanium, 49mm always-on Retina, dual-frequency GPS, 60hr battery.',   850000, 900000, 8,  ARRAY['https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600','https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600'], 'Apple',   4.9, 187, true),
  ('Samsung Galaxy Watch 6 Classic','47mm rotating bezel, BioActive Sensor, sleep coaching, 40hr battery.', 350000, 400000, 15, ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600','https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600'], 'Samsung', 4.7, 124, true),
  ('Garmin Epix Gen 2',             'AMOLED, multi-band GPS, 16-day battery, advanced training metrics.',    950000, null,   6,  ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600','https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'], 'Garmin',  4.8, 73,  false),
  ('Google Pixel Watch 2',          'Wear OS 4, Fitbit health suite, 24hr HR, emergency SOS.',               320000, 360000, 20, ARRAY['https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600','https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600'], 'Google',  4.6, 89,  false),
  ('Huawei Watch GT 4',             '46mm, 14-day battery, GPS, professional health monitoring.',             250000, 280000, 25, ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc603507?q=80&w=600','https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=600'], 'Huawei',  4.5, 102, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'smartwatches';

-- Products — Tablets
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('iPad Pro 13" M4',              'Ultra Retina XDR OLED, M4 chip, Apple Pencil Pro support.',            1400000, 1550000, 7,  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600','https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600'], 'Apple',     4.9, 156, true),
  ('Samsung Galaxy Tab S9 Ultra',  '14.6" Super AMOLED, Snapdragon 8 Gen 2, IP68, S Pen, 12GB RAM.',      1100000, 1250000, 9,  ARRAY['https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600'], 'Samsung',   4.8, 98,  true),
  ('Microsoft Surface Pro 9',      '13" PixelSense Flow, Intel Evo i7, 16GB RAM, Surface Pen support.',    950000,  null,   11, ARRAY['https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=600','https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=600'], 'Microsoft', 4.7, 67,  false),
  ('Xiaomi Pad 6 Pro',             '11" 144Hz display, Snapdragon 8+ Gen 1, Dolby Atmos, 8600mAh.',       450000,  500000, 18, ARRAY['https://images.unsplash.com/photo-1542751110-9764648393fb?q=80&w=600','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600'], 'Xiaomi',    4.6, 134, false),
  ('Lenovo Tab P12 Pro',           '12.6" Super AMOLED 2K, Snapdragon 870, JBL quad speakers.',           650000,  720000, 14, ARRAY['https://images.unsplash.com/photo-1527690789675-4ea7d8da4fe3?q=80&w=600','https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=600'], 'Lenovo',    4.5, 81,  false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'tablets';

-- Products — Cameras
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Sony Alpha A7 IV',      '33MP full-frame, 4K 60p video, 759 AF points, 5-axis IBIS.',          2500000, 2700000, 5,  ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600'], 'Sony',    4.9, 134, true),
  ('Canon EOS R6 Mark II',  '24.2MP full-frame, 6K RAW video, 40fps burst, AI subject AF.',        2400000, 2600000, 4,  ARRAY['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600','https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600'], 'Canon',   4.9, 98,  true),
  ('Fujifilm X-T5',         '40MP APS-C, 6.2K video, IBIS, film simulations, compact retro.',      1800000, null,   7,  ARRAY['https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=600','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'], 'Fujifilm', 4.8, 77,  false),
  ('GoPro Hero 12 Black',   '5.3K60 video, HyperSmooth 6.0, waterproof to 10m, HDR.',              450000,  500000, 22, ARRAY['https://images.unsplash.com/photo-1562184120-da3e884fbf34?q=80&w=600','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'], 'GoPro',   4.7, 298, false),
  ('DJI Osmo Pocket 3',     '1-inch CMOS, 4K/120fps, 3-axis gimbal, face tracking.',               550000,  620000, 12, ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600'], 'DJI',     4.8, 167, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'cameras';

-- Products — Gaming
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('PlayStation 5 Slim',    'Ultra-HD Blu-ray, 1TB SSD, DualSense, 4K@120fps, backward compat.',  650000, 700000, 10, ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600','https://images.unsplash.com/photo-1606813907291-d86ebb9c74ad?q=80&w=600'], 'Sony',      4.9, 520, true),
  ('Xbox Series X',         '4K@120fps, 12 TFLOPS GPU, 1TB NVMe, Quick Resume, Game Pass.',       620000, null,   8,  ARRAY['https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?q=80&w=600','https://images.unsplash.com/photo-1605901309584-818e25960a8f?q=80&w=600'], 'Microsoft', 4.8, 380, true),
  ('Nintendo Switch OLED',  '7-inch OLED, enhanced audio, 64GB storage, wide adjustable stand.',  420000, 460000, 15, ARRAY['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=600','https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600'], 'Nintendo',  4.8, 312, false),
  ('Steam Deck OLED 512GB', '7.4-inch OLED HDR, AMD Zen 2 + RDNA 2, 50Whr battery.',             750000, 820000, 6,  ARRAY['https://images.unsplash.com/photo-1660076294523-28846c4f749a?q=80&w=600','https://images.unsplash.com/photo-1660076282307-e85501869e5d?q=80&w=600'], 'Valve',     4.7, 218, false),
  ('Razer Kishi V2 Pro',    'Console-quality Android controller, haptic feedback, USB-C.',        85000,  null,   30, ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=600','https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?q=80&w=600'], 'Razer',     4.6, 145, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'gaming';

-- Products — Accessories
INSERT INTO public.products (name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured, is_active, category_id)
SELECT p.name, p.description, p.price, p.compare_price, p.stock, p.images, p.brand, p.rating, p.review_count, p.is_featured, true, c.id
FROM (VALUES
  ('Logitech MX Master 3S', '8K DPI, ultra-quiet clicks, MagSpeed wheel, Bluetooth + USB.',         120000, 140000, 35, ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=600','https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600'], 'Logitech', 4.9, 620, true),
  ('Anker 737 Power Bank',  '24000mAh, 140W total, dual USB-C + USB-A, charges MBP in 1.5hrs.',    150000, 170000, 28, ARRAY['https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600','https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600'], 'Anker',    4.9, 445, true),
  ('Keychron Q1 Pro',       '75% layout, QMK/Via, hot-swap, aluminum body, RGB, wireless.',         250000, 280000, 15, ARRAY['https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600','https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=600'], 'Keychron', 4.8, 187, false),
  ('Samsung T7 Shield 2TB', 'IP65, shock resistant, USB 3.2 Gen 2, 1050MB/s, AES-256.',            180000, 210000, 20, ARRAY['https://images.unsplash.com/photo-1593642634315-48f541e24a64?q=80&w=600','https://images.unsplash.com/photo-1593642634315-48f541e24a64?q=80&w=600'], 'Samsung',  4.8, 234, false),
  ('Belkin MagSafe 3-in-1', 'Charge iPhone + Apple Watch + AirPods simultaneously, 15W.',           95000,  null,   40, ARRAY['https://images.unsplash.com/photo-1609091839311-d5364f512c58?q=80&w=600','https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600'], 'Belkin',   4.6, 312, false)
) AS p(name, description, price, compare_price, stock, images, brand, rating, review_count, is_featured)
JOIN public.categories c ON c.slug = 'accessories';

-- ══════════════════════════════════════════════════════════════
-- ADMIN USER: samlite250@gmail.com / @Samlite1
-- ══════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_user_id UUID;
  v_email   TEXT := 'samlite250@gmail.com';
  v_pass    TEXT := '@Samlite1';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := uuid_generate_v4();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      role, aud, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_pass, gen_salt('bf')),
      now(), 'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Samlite Admin"}',
      now(), now(), '', ''
    );
    RAISE NOTICE 'Admin user created: %', v_email;
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt(v_pass, gen_salt('bf')), updated_at = now()
    WHERE id = v_user_id;
    RAISE NOTICE 'User % already existed — password updated.', v_email;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, is_active)
  VALUES (v_user_id, 'Samlite Admin', v_email, 'admin', true)
  ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true, email = v_email;

  RAISE NOTICE 'Admin profile ready for: %', v_email;
END $$;

-- ─── Final check ──────────────────────────────────────────────
SELECT 'categories' AS tbl, COUNT(*) FROM public.categories
UNION ALL SELECT 'products',         COUNT(*) FROM public.products
UNION ALL SELECT 'banners',          COUNT(*) FROM public.banners
UNION ALL SELECT 'promo_codes',      COUNT(*) FROM public.promo_codes
UNION ALL SELECT 'platform_settings',COUNT(*) FROM public.platform_settings
UNION ALL SELECT 'suppliers',        COUNT(*) FROM public.suppliers
ORDER BY tbl;
