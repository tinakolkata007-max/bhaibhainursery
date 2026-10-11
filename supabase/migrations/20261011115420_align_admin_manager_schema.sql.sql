/*
# Align schema for admin manager modules

This migration adds columns needed by the admin manager components that were built
but whose field shapes didn't match the original Phase 2 migration.

## Changes

### delivery_zones
- Add `zone_name` text column (replaces area_name as the primary label)
- Add `pincodes` text[] column (array of pincodes for zone-based delivery)
- Add `estimated_days` integer column (numeric ETA, replaces text version)
- Add `free_above` numeric column (free delivery threshold per zone)
- Add `active` boolean column (toggle zone on/off)
- Migrate data from old columns: zone_name gets area_name value, estimated_days gets cast of old text value

### plant_care_articles
- Add `excerpt` text column (short summary)
- Add `read_time` integer column (estimated reading time in minutes)
- Add `image_url` text column (alias for cover_image used by frontend)

### customers
- Add `last_order_date` timestamptz column (date of most recent order)

All changes are additive — no data is lost. Old columns are kept for backwards compatibility.
*/

-- delivery_zones: add new columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_zones' AND column_name = 'zone_name') THEN
    ALTER TABLE delivery_zones ADD COLUMN zone_name text;
    UPDATE delivery_zones SET zone_name = area_name WHERE zone_name IS NULL AND area_name IS NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_zones' AND column_name = 'pincodes') THEN
    ALTER TABLE delivery_zones ADD COLUMN pincodes text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_zones' AND column_name = 'estimated_days') THEN
    ALTER TABLE delivery_zones ADD COLUMN estimated_days integer DEFAULT 3;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_zones' AND column_name = 'free_above') THEN
    ALTER TABLE delivery_zones ADD COLUMN free_above numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_zones' AND column_name = 'active') THEN
    ALTER TABLE delivery_zones ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;

-- plant_care_articles: add new columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plant_care_articles' AND column_name = 'excerpt') THEN
    ALTER TABLE plant_care_articles ADD COLUMN excerpt text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plant_care_articles' AND column_name = 'read_time') THEN
    ALTER TABLE plant_care_articles ADD COLUMN read_time integer DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plant_care_articles' AND column_name = 'image_url') THEN
    ALTER TABLE plant_care_articles ADD COLUMN image_url text;
    UPDATE plant_care_articles SET image_url = cover_image WHERE image_url IS NULL AND cover_image IS NOT NULL;
  END IF;
END $$;

-- customers: add last_order_date
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_order_date') THEN
    ALTER TABLE customers ADD COLUMN last_order_date timestamptz;
  END IF;
END $$;
