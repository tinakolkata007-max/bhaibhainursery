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
  images: string[];
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface ProductWithCategory extends Product {
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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_pincode: string;
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: string;
  created_at: string;
}
