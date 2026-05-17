-- Gisenyi Gadgets — initial schema (all tables, RLS, indexes, triggers)
-- This is the canonical migration; sourced from schema.sql + migrations 002–012

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SUPPLIERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
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
CREATE TABLE IF NOT EXISTS public.vendors (
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
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT NOT NULL UNIQUE DEFAULT ('GGS' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8))),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_method    TEXT CHECK (payment_method IN ('momo','mtn','airtel','bank','crypto','card','cash')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
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
CREATE TABLE IF NOT EXISTS public.order_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES public.orders(id)  ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.reviews (
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

-- ─── WISHLISTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT DEFAULT 'general' CHECK (type IN ('order','promo','system','general')),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHAT MESSAGES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  reactions   JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BANNERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          TEXT NOT NULL DEFAULT 'banner' CHECK (type IN ('banner','offer')),
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
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code           TEXT NOT NULL UNIQUE,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  max_uses       INTEGER,
  uses_count     INTEGER NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PLATFORM SETTINGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── UPDATED_AT TRIGGERS ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_vendors_updated_at   BEFORE UPDATE ON public.vendors    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_products_updated_at  BEFORE UPDATE ON public.products   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_orders_updated_at    BEFORE UPDATE ON public.orders     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_own_read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"  ON public.profiles;
CREATE POLICY "profiles_own_read"   ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"  ON public.profiles USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Categories
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_all_access"  ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_all_access"  ON public.categories USING (true) WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_all_access"  ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "products_all_access"  ON public.products USING (true) WITH CHECK (true);

-- Suppliers
DROP POLICY IF EXISTS "suppliers_all_access" ON public.suppliers;
CREATE POLICY "suppliers_all_access" ON public.suppliers USING (true) WITH CHECK (true);

-- Vendors
DROP POLICY IF EXISTS "vendors_public_read" ON public.vendors;
DROP POLICY IF EXISTS "vendors_all_access"  ON public.vendors;
CREATE POLICY "vendors_public_read" ON public.vendors FOR SELECT USING (is_active = true);
CREATE POLICY "vendors_all_access"  ON public.vendors USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "orders_own_read"   ON public.orders;
DROP POLICY IF EXISTS "orders_own_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_all_access" ON public.orders;
CREATE POLICY "orders_own_read"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_own_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_all_access" ON public.orders USING (true) WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "order_items_own_read"   ON public.order_items;
DROP POLICY IF EXISTS "order_items_own_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_all_access" ON public.order_items;
CREATE POLICY "order_items_own_read"   ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "order_items_own_insert" ON public.order_items FOR INSERT WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));
CREATE POLICY "order_items_all_access" ON public.order_items USING (true) WITH CHECK (true);

-- Reviews
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_auth_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_own_update"  ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_update"  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Wishlists
DROP POLICY IF EXISTS "wishlists_own_read"   ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_own_insert" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_own_delete" ON public.wishlists;
CREATE POLICY "wishlists_own_read"   ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlists_own_insert" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlists_own_delete" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "notifications_own_read"   ON public.notifications;
DROP POLICY IF EXISTS "notifications_own_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all"  ON public.notifications;
CREATE POLICY "notifications_own_read"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_admin_all"  ON public.notifications USING (true) WITH CHECK (true);

-- Chat
DROP POLICY IF EXISTS "chat_own_read"   ON public.chat_messages;
DROP POLICY IF EXISTS "chat_own_insert" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_update"     ON public.chat_messages;
CREATE POLICY "chat_own_read"   ON public.chat_messages FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "chat_own_insert" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "chat_update"     ON public.chat_messages FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Banners
DROP POLICY IF EXISTS "banners_public_read" ON public.banners;
DROP POLICY IF EXISTS "banners_all_access"  ON public.banners;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "banners_all_access"  ON public.banners USING (true) WITH CHECK (true);

-- Promo Codes
DROP POLICY IF EXISTS "promo_public_read" ON public.promo_codes;
DROP POLICY IF EXISTS "promo_admin_all"   ON public.promo_codes;
CREATE POLICY "promo_public_read" ON public.promo_codes FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "promo_admin_all"   ON public.promo_codes USING (true) WITH CHECK (true);

-- Platform Settings
DROP POLICY IF EXISTS "platform_settings_public_read" ON public.platform_settings;
DROP POLICY IF EXISTS "platform_settings_admin_all"   ON public.platform_settings;
CREATE POLICY "platform_settings_public_read" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "platform_settings_admin_all"   ON public.platform_settings USING (true) WITH CHECK (true);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured  ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_user        ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product    ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user     ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_user          ON public.chat_messages(user_id, created_at);

-- ─── STORAGE BUCKETS ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('review-images', 'review-images', true, 3145728, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_read"   ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_read"          ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert"        ON storage.objects;
DROP POLICY IF EXISTS "avatars_update"        ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete"        ON storage.objects;
DROP POLICY IF EXISTS "review_images_read"    ON storage.objects;
DROP POLICY IF EXISTS "review_images_insert"  ON storage.objects;

CREATE POLICY "product_images_read"   ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "product_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "product_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
CREATE POLICY "avatars_read"          ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert"        ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_update"        ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_delete"        ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "review_images_read"    ON storage.objects FOR SELECT USING (bucket_id = 'review-images');
CREATE POLICY "review_images_insert"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-images');

-- ─── SEED DATA ────────────────────────────────────────────────
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Smartphones','smartphones','📱',1),('Laptops','laptops','💻',2),
  ('Headphones','headphones','🎧',3),('Smartwatches','smartwatches','⌚',4),
  ('Tablets','tablets','📟',5),('Cameras','cameras','📷',6),
  ('Accessories','accessories','🔌',7),('Gaming','gaming','🎮',8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.promo_codes (code, discount_type, discount_value, is_active) VALUES
  ('GADGET10','percent',10,true),('WELCOME20','percent',20,true),('GISENYI','fixed',5000,true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.platform_settings (key, value) VALUES
  ('platformName','"Gisenyi Gadgets"'),('currency','"RWF"'),
  ('supportEmail','"support@gisenyigadgets.rw"'),('whatsapp_number','"+250788000000"'),
  ('mtnNumber','"+250781000000"'),('airtelNumber','"+250731000000"'),
  ('standardShippingFee','"2000"'),('freeShippingThreshold','"50000"'),('lowStockThreshold','"5"')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.banners (type, title, subtitle, button_text, color, image_url, sort_order) VALUES
  ('banner','Big Sale Up to 40% OFF','On all electronics','Shop Now','#1E293B','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300',1),
  ('banner','Apple Days - Save RWF 200K','MacBooks & iPads','Explore','#475569','https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300',2),
  ('banner','Smart Wear Trending','Upgrade your style','View Deals','#64748B','https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300',3);

INSERT INTO public.banners (type, label, discount, tagline, color, image_url, link_category, sort_order) VALUES
  ('offer','Smartphones','30% OFF','Top picks this week','#3B82F6','https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600','smartphones',1),
  ('offer','Laptops','20% OFF','Work smarter, save more','#0EA5E9','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600','laptops',2),
  ('offer','Headphones','40% OFF','Sound deals today','#0891B2','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600','headphones',3),
  ('offer','Smartwatches','25% OFF','Style meets tech','#10B981','https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600','smartwatches',4),
  ('offer','Cameras','15% OFF','Capture every moment','#F59E0B','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600','cameras',5);

INSERT INTO public.suppliers (name, phone, business_name, location, commission_rate, notes) VALUES
  ('Jean-Pierre Habimana','+250 788 123 456','JP Electronics','Gisenyi Market',15,'Supplies iPhones and Samsung phones.'),
  ('Marie Claire Uwimana','+250 788 234 567','MC Tech Store','Rubavu',20,'Laptops and tablets.')
ON CONFLICT DO NOTHING;
