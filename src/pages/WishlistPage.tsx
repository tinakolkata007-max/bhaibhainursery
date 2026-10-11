import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice, getDiscountedPrice } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts } = useWishlist();
  const { settings } = useSettings();
  const currency = settings?.currency_symbol || '₹';

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-primary-300" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-6">Save your favorite plants here for easy access later.</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">Browse Plants</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
      <p className="text-gray-500 mb-8">{wishlistProducts.length} plant{wishlistProducts.length !== 1 ? 's' : ''} saved</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
