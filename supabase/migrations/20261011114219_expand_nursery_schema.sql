/*
# Expand Nursery Schema — Reviews, Coupons, Plant Care, Wishlist, Inventory, Customers, Delivery Zones, Order History

1. New Tables
- `product_reviews` — Customer reviews with star ratings, moderation
- `coupons` — Discount codes (percentage/fixed, date range, usage limits, min order)
- `plant_care_articles` — Blog/guide articles with plant care info
- `wishlist` — Customer wishlist (guest mode, stored by session)
- `inventory_movements` — Stock adjustment history
- `delivery_zones` — PIN code serviceability and area-specific charges
- `order_status_history` — Timeline of order status changes
- `customers` — Customer records derived from orders

2. Modified Tables
- `products` — Added: short_description, original_price, low_stock_threshold, is_new, is_bestseller, height, pot_size, sunlight, watering, soil_type, fertilizer, indoor_outdoor, difficulty, seasonal, seo_title, seo_description, seo_slug, subcategory
- `orders` — Added: order_ref, city, state, delivery_instructions, admin_notes, coupon_code, coupon_discount
- `site_settings` — Added: announcement_bar, business_hours, free_delivery_threshold, min_order_amount, cod_enabled, bank_transfer_enabled, payment_info, privacy_policy, terms_conditions, shipping_policy, return_policy, store_open

3. Security
- RLS enabled on all new tables
- Public can read approved reviews, published articles, active coupons, delivery zones
- Public can add reviews and wishlist items
- Admin-only for inventory movements, coupon management, article management, customer data
*/

-- Add columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold int NOT NULL DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pot_size text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sunlight text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS watering text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS soil_type text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fertilizer text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS indoor_outdoor text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS difficulty text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seasonal text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory text;

-- Add columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_ref text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount numeric(10,2) DEFAULT 0;

-- Add columns to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_bar text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS business_hours text NOT NULL DEFAULT 'Mon - Sat, 9:00 AM - 7:00 PM';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS free_delivery_threshold numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS min_order_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS cod_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS bank_transfer_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_info text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS privacy_policy text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS terms_conditions text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS shipping_policy text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS return_policy text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS store_open boolean NOT NULL DEFAULT true;

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_approved_reviews" ON product_reviews;
CREATE POLICY "public_read_approved_reviews" ON product_reviews FOR SELECT
  TO anon, authenticated USING (approved = true);

DROP POLICY IF EXISTS "admin_read_all_reviews" ON product_reviews;
CREATE POLICY "admin_read_all_reviews" ON product_reviews FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "public_insert_reviews" ON product_reviews;
CREATE POLICY "public_insert_reviews" ON product_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reviews" ON product_reviews;
CREATE POLICY "admin_update_reviews" ON product_reviews FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_reviews" ON product_reviews;
CREATE POLICY "admin_delete_reviews" ON product_reviews FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(approved);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  max_discount_amount numeric(10,2),
  usage_limit int,
  used_count int NOT NULL DEFAULT 0,
  per_customer_limit int,
  start_date timestamptz,
  end_date timestamptz,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_coupons" ON coupons;
CREATE POLICY "public_read_active_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Plant care articles
CREATE TABLE IF NOT EXISTS plant_care_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_image text,
  category text,
  content text NOT NULL,
  watering_advice text,
  sunlight_guidance text,
  soil_fertilizer_advice text,
  common_problems text,
  seo_title text,
  seo_description text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plant_care_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_articles" ON plant_care_articles;
CREATE POLICY "public_read_published_articles" ON plant_care_articles FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "admin_read_all_articles" ON plant_care_articles;
CREATE POLICY "admin_read_all_articles" ON plant_care_articles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_articles" ON plant_care_articles;
CREATE POLICY "admin_insert_articles" ON plant_care_articles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_articles" ON plant_care_articles;
CREATE POLICY "admin_update_articles" ON plant_care_articles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_articles" ON plant_care_articles;
CREATE POLICY "admin_delete_articles" ON plant_care_articles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Wishlist (guest mode, stored by session identifier)
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_wishlist" ON wishlist;
CREATE POLICY "public_read_wishlist" ON wishlist FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_wishlist" ON wishlist;
CREATE POLICY "public_insert_wishlist" ON wishlist FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_wishlist" ON wishlist;
CREATE POLICY "public_delete_wishlist" ON wishlist FOR DELETE
  TO anon, authenticated USING (true);

-- Inventory movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('stock_in', 'stock_out', 'adjustment')),
  quantity int NOT NULL,
  reason text,
  previous_stock int,
  new_stock int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_movements" ON inventory_movements;
CREATE POLICY "admin_read_movements" ON inventory_movements FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_movements" ON inventory_movements;
CREATE POLICY "admin_insert_movements" ON inventory_movements FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_movements_product ON inventory_movements(product_id);

-- Delivery zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code text NOT NULL,
  area_name text,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  is_serviceable boolean NOT NULL DEFAULT true,
  estimated_days text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pin_code)
);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_delivery_zones" ON delivery_zones;
CREATE POLICY "public_read_delivery_zones" ON delivery_zones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_delivery_zones" ON delivery_zones;
CREATE POLICY "admin_insert_delivery_zones" ON delivery_zones FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_delivery_zones" ON delivery_zones;
CREATE POLICY "admin_update_delivery_zones" ON delivery_zones FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_delivery_zones" ON delivery_zones;
CREATE POLICY "admin_delete_delivery_zones" ON delivery_zones FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  admin_notes text,
  changed_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_order_history" ON order_status_history;
CREATE POLICY "admin_read_order_history" ON order_status_history FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_insert_order_history" ON order_status_history;
CREATE POLICY "admin_insert_order_history" ON order_status_history FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id);

-- Customers (derived from orders)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  pincode text,
  city text,
  state text,
  total_orders int NOT NULL DEFAULT 0,
  total_spent numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(phone)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_customers" ON customers;
CREATE POLICY "admin_read_customers" ON customers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );
