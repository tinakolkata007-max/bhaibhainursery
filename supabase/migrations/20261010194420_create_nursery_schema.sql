/*
# Nursery Plants E-Commerce Schema

1. New Tables
- `admins` — Links auth.users to admin role. Users must be in this table to manage products/settings.
- `categories` — Plant categories (Indoor, Flowering, Fruit, Outdoor, Medicinal).
- `products` — Plant products. Max 24 active enforced by trigger.
- `site_settings` — Singleton config (WhatsApp number, delivery charges, store info).
- `orders` — Customer orders for optional order recording.

2. Security
- RLS on all tables.
- Public (anon) can read active products, categories, and settings; can create orders.
- Admin operations require authenticated session AND entry in admins table.

3. Notes
- 24 active product limit enforced by database trigger.
- site_settings is a singleton (id=1).
*/

-- Admins table (must come first, referenced by product/category policies)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_admins" ON admins;
CREATE POLICY "admin_read_admins" ON admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  discount numeric(5,2) NOT NULL DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  description text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT
  TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "admin_read_all_products" ON products;
CREATE POLICY "admin_read_all_products" ON products FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Site settings table (singleton)
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  store_name text NOT NULL DEFAULT 'Green Haven Nursery',
  whatsapp_number text NOT NULL DEFAULT '919999999999',
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  currency_symbol text NOT NULL DEFAULT '₹',
  hero_title text NOT NULL DEFAULT 'Bring Nature Home',
  hero_subtitle text NOT NULL DEFAULT 'Hand-picked, healthy plants delivered to your doorstep',
  about_text text NOT NULL DEFAULT 'We are a family-run nursery passionate about bringing greenery into every home. Every plant is carefully nurtured and quality-checked before it reaches you.',
  contact_email text NOT NULL DEFAULT 'contact@greenhavennursery.com',
  contact_phone text NOT NULL DEFAULT '+91 99999 99999',
  address text NOT NULL DEFAULT '123 Garden Road, Green City, India 560001',
  instagram_url text NOT NULL DEFAULT '',
  facebook_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT singleton_settings CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_pincode text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;

-- Trigger to enforce max 24 active products
CREATE OR REPLACE FUNCTION enforce_max_active_products()
RETURNS trigger AS $$
DECLARE
  active_count int;
BEGIN
  SELECT COUNT(*) INTO active_count FROM products WHERE active = true AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  IF active_count >= 24 AND NEW.active = true THEN
    RAISE EXCEPTION 'Cannot have more than 24 active products. Deactivate another product first.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_max_active ON products;
CREATE TRIGGER trigger_enforce_max_active
  BEFORE INSERT OR UPDATE OF active ON products
  FOR EACH ROW EXECUTE FUNCTION enforce_max_active_products();

-- Seed site_settings
INSERT INTO site_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;
