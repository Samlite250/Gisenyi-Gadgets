-- ============================================================
-- GISENYI GADGETS — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- ─── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ─────────────────────────────────────────────────
-- Extends Supabase auth.users with additional user data
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  address       TEXT,
  city          TEXT DEFAULT 'Gisenyi',
  country       TEXT DEFAULT 'Rwanda',
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Seed default categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Smartphones', 'smartphones', '📱', 1),
  ('Laptops', 'laptops', '💻', 2),
  ('Headphones', 'headphones', '🎧', 3),
  ('Smartwatches', 'smartwatches', '⌚', 4),
  ('Tablets', 'tablets', '📟', 5),
  ('Cameras', 'cameras', '📷', 6),
  ('Accessories', 'accessories', '🔌', 7),
  ('Gaming', 'gaming', '🎮', 8);

-- ─── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id       UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_price   NUMERIC(12,2),  -- Original price (for showing discount)
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
  payment_method    TEXT CHECK (payment_method IN ('momo', 'card', 'cash')),
  payment_status    TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_address  JSONB,    -- { name, phone, address, city, country }
  notes             TEXT,
  estimated_delivery DATE,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE public.order_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES public.products(id) ON DELETE SET NULL,
  vendor_id        UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  product_name     TEXT NOT NULL,  -- Snapshot at time of purchase
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
  order_id    UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
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

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at   BEFORE UPDATE ON public.profiles   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_vendors_updated_at    BEFORE UPDATE ON public.vendors     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_products_updated_at   BEFORE UPDATE ON public.products    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_orders_updated_at     BEFORE UPDATE ON public.orders      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── ROW LEVEL SECURITY (RLS) ──────────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Profiles: own read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Products: publicly readable
CREATE POLICY "Categories: public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Products: public read"   ON public.products   FOR SELECT USING (is_active = true);

-- Vendors: publicly readable
CREATE POLICY "Vendors: public read" ON public.vendors FOR SELECT USING (is_active = true);

-- Orders: users see own orders
CREATE POLICY "Orders: own read"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders: own insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: users see items in their orders
CREATE POLICY "Order items: own read" ON public.order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- Reviews: public read, own write
CREATE POLICY "Reviews: public read"  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviews: own insert"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews: own update"   ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Wishlists: own only
CREATE POLICY "Wishlists: own read"   ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wishlists: own insert" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Wishlists: own delete" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Notifications: own only
CREATE POLICY "Notifications: own read"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications: own update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── INDEXES FOR PERFORMANCE ───────────────────────────────────
CREATE INDEX idx_products_category   ON public.products(category_id);
CREATE INDEX idx_products_vendor     ON public.products(vendor_id);
CREATE INDEX idx_products_featured   ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_orders_user         ON public.orders(user_id);
CREATE INDEX idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX idx_reviews_product     ON public.reviews(product_id);
CREATE INDEX idx_wishlists_user      ON public.wishlists(user_id);
CREATE INDEX idx_notifications_user  ON public.notifications(user_id, is_read);
