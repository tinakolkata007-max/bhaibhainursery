import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  wishlistProducts: Product[];
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const SESSION_KEY = 'nursery-session-id';
const LOCAL_WISHLIST_KEY = 'nursery-wishlist-ids';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    if (stored) {
      setWishlistIds(JSON.parse(stored));
    }
    supabase
      .from('wishlist')
      .select('product_id')
      .eq('session_id', sessionId)
      .then(({ data }) => {
        const ids = (data || []).map((r: any) => r.product_id);
        setWishlistIds(ids);
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(ids));
        setLoading(false);
      });
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .in('id', wishlistIds)
      .eq('active', true)
      .then(({ data }) => setWishlistProducts(data || []));
  }, [wishlistIds]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        supabase.from('wishlist').delete().eq('session_id', sessionId).eq('product_id', product.id);
        return prev.filter((id) => id !== product.id);
      } else {
        supabase.from('wishlist').insert({ session_id: sessionId, product_id: product.id });
        return [...prev, product.id];
      }
    });
  }, [sessionId]);

  const isInWishlist = useCallback((productId: string) => wishlistIds.includes(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, wishlistProducts, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
