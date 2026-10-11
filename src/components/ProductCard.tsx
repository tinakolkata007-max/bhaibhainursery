import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice, getDiscountedPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();
  const currency = settings?.currency_symbol || '₹';
  const outOfStock = product.stock <= 0;
  const discounted = getDiscountedPrice(product);
  const wished = isInWishlist(product.id);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && !outOfStock && (
            <span className="bg-secondary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{product.discount}% OFF</span>
          )}
          {product.is_new && (
            <span className="bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">NEW</span>
          )}
          {product.is_bestseller && (
            <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">BESTSELLER</span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-800 text-sm font-bold px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 rounded-full px-4 py-2 text-sm font-medium text-gray-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> View Details
          </span>
        </div>
      </Link>

      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
          wished ? 'bg-error-500 text-white' : 'bg-white/90 text-gray-600 hover:text-error-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${wished ? 'fill-white' : ''}`} />
      </button>

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-primary-500 font-semibold mb-1">{product.category?.name || 'Plant'}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm leading-snug hover:text-primary-600 transition-colors line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        </Link>
        {product.short_description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.short_description}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(discounted, currency)}</span>
          {product.discount > 0 && <span className="text-sm text-gray-400 line-through">{formatPrice(product.price, currency)}</span>}
        </div>
        <button
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          className="mt-3 w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" /> {outOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
