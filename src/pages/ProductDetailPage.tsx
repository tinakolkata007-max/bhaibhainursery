import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, Minus, Plus, Check, Leaf, Truck, Shield,
  Heart, Share2, MessageCircle, Sun, Droplets, Sprout, Ruler, Flower2,
  Wrench, TrendingUp, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { formatPrice, getDiscountedPrice, getWhatsAppUrl } from '@/lib/utils';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const currency = settings?.currency_symbol || '₹';

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setActiveImage(0);
    setQuantity(1);
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
        if (data) {
          addRecentlyViewed(data);
          if (data.category_id) {
            supabase
              .from('products')
              .select('*, category:categories(*)')
              .eq('active', true)
              .eq('category_id', data.category_id)
              .neq('id', data.id)
              .limit(4)
              .then(({ data: relData }) => setRelated(relData || []));
          }
        }
      });
  }, [id, addRecentlyViewed]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url }); } catch { /* ignore */ }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const msg = `Hello! I'm interested in this plant:\n\n*${product.name}*\nSKU: ${product.sku}\nPrice: ${formatPrice(getDiscountedPrice(product), currency)}\n\nIs this available?`;
    window.open(getWhatsAppUrl(settings?.whatsapp_number || '919999999999', msg), '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link to="/shop" className="mt-4 inline-block text-primary-600 font-medium hover:text-primary-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const discounted = getDiscountedPrice(product);
  const inWishlist = isInWishlist(product.id);

  const careInfo = [
    { icon: Sun, label: 'Sunlight', value: product.sunlight, show: !!product.sunlight },
    { icon: Droplets, label: 'Watering', value: product.watering, show: !!product.watering },
    { icon: Sprout, label: 'Soil Type', value: product.soil_type, show: !!product.soil_type },
    { icon: Ruler, label: 'Height', value: product.height, show: !!product.height },
    { icon: Flower2, label: 'Pot Size', value: product.pot_size, show: !!product.pot_size },
    { icon: Wrench, label: 'Fertilizer', value: product.fertilizer, show: !!product.fertilizer },
    { icon: Leaf, label: 'Indoor/Outdoor', value: product.indoor_outdoor, show: !!product.indoor_outdoor },
    { icon: TrendingUp, label: 'Difficulty', value: product.difficulty, show: !!product.difficulty },
    { icon: Calendar, label: 'Seasonal', value: product.seasonal, show: !!product.seasonal },
  ].filter((c) => c.show);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && !outOfStock && (
              <span className="absolute top-4 left-4 bg-secondary-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                {product.discount}% OFF
              </span>
            )}
            {outOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white/90 text-gray-800 font-bold px-6 py-3 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary-600 font-semibold mb-2">
                {product.category?.name}
              </p>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-sm text-gray-400 mb-4">SKU: {product.sku}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${inWishlist ? 'bg-error-50 text-error-500' : 'bg-gray-100 text-gray-400 hover:text-error-500'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-error-500' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:text-primary-600 flex items-center justify-center transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {product.short_description && (
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{product.short_description}</p>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(discounted, currency)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price, currency)}</span>
                <span className="text-sm text-secondary-600 font-medium">
                  Save {formatPrice(product.price - discounted, currency)}
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-2 mb-6">
            {outOfStock ? (
              <span className="text-sm text-error-600 font-medium">Currently unavailable</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm text-accent-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-500" />
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="text-sm text-success-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> In stock ({product.stock} available)
              </span>
            )}
          </div>

          {!outOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-1.5 bg-white rounded-xl border border-gray-200 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-medium w-10 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 py-3.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {added ? (
                <><Check className="w-5 h-5" /> Added!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
              )}
            </button>
            <Link
              to="/checkout"
              className="flex-1 py-3.5 bg-secondary-500 text-white rounded-xl font-medium hover:bg-secondary-600 disabled:bg-gray-200 transition-colors text-center"
            >
              Buy Now
            </Link>
          </div>

          <button
            onClick={handleWhatsAppEnquiry}
            className="w-full py-3 bg-[#25D366]/10 text-[#1da851] rounded-xl font-medium hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-2 mb-8"
          >
            <MessageCircle className="w-5 h-5" /> Enquire on WhatsApp
          </button>

          {/* Feature badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            {[
              { icon: Leaf, label: 'Healthy Plant' },
              { icon: Truck, label: 'Safe Delivery' },
              { icon: Shield, label: 'Quality Checked' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
                <item.icon className="w-5 h-5 text-primary-500" />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plant Care Info */}
      {careInfo.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Plant Care Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {careInfo.map((info) => (
              <div key={info.label} className="bg-primary-50/50 rounded-2xl p-5 border border-primary-100/50">
                <info.icon className="w-5 h-5 text-primary-600 mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{info.label}</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{info.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewSection productId={product.id} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
