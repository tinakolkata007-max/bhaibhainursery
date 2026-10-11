export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  sku: string;
  name: string;
  price: number;
  discount: number;
  stock: number;
  description: string | null;
  short_description: string | null;
  original_price: number | null;
  low_stock_threshold: number;
  images: string[];
  active: boolean;
  featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  height: string | null;
  pot_size: string | null;
  sunlight: string | null;
  watering: string | null;
  soil_type: string | null;
  fertilizer: string | null;
  indoor_outdoor: string | null;
  difficulty: string | null;
  seasonal: string | null;
  subcategory: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_slug: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface SiteSettings {
  id: number;
  store_name: string;
  whatsapp_number: string;
  delivery_charge: number;
  currency_symbol: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  announcement_bar: string | null;
  business_hours: string;
  free_delivery_threshold: number;
  min_order_amount: number;
  cod_enabled: boolean;
  bank_transfer_enabled: boolean;
  payment_info: string | null;
  privacy_policy: string | null;
  terms_conditions: string | null;
  shipping_policy: string | null;
  return_policy: string | null;
  store_open: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_ref: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_pincode: string;
  city: string | null;
  state: string | null;
  delivery_instructions: string | null;
  admin_notes: string | null;
  coupon_code: string | null;
  coupon_discount: number;
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: string;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  approved: boolean;
  created_at: string;
  product?: { name: string } | null;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  per_customer_limit: number | null;
  start_date: string | null;
  end_date: string | null;
  product_id: string | null;
  category_id: string | null;
  active: boolean;
  created_at: string;
}

export interface PlantCareArticle {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  category: string | null;
  excerpt: string | null;
  content: string;
  read_time: number | null;
  image_url: string | null;
  watering_advice: string | null;
  sunlight_guidance: string | null;
  soil_fertilizer_advice: string | null;
  common_problems: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  reason: string | null;
  previous_stock: number | null;
  new_stock: number | null;
  created_at: string;
  product?: Product | null;
}

export interface DeliveryZone {
  id: string;
  zone_name: string;
  pincodes: string[] | null;
  delivery_charge: number;
  estimated_days: number;
  free_above: number | null;
  active: boolean;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  admin_notes: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  pincode: string | null;
  city: string | null;
  state: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  created_at: string;
}
