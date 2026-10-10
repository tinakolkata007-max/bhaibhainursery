import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('active', true)
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('display_order'),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategoryName = categories.find((c) => c.slug === selectedCategory);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          {activeCategoryName ? activeCategoryName.name : 'All Plants'}
        </h1>
        <p className="text-gray-500 mt-2">
          {activeCategoryName?.description || 'Browse our complete collection of healthy, hand-picked plants.'}
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plants by name or SKU..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
          />
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-3 px-4 rounded-xl border border-gray-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Plants
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.slug
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {(selectedCategory || searchQuery) && (
          <button
            onClick={() => {
              setSearchParams({});
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-full text-sm text-gray-500 hover:text-error-500 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {loading ? 'Loading...' : `${filtered.length} plant${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-9 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No plants found matching your search.</p>
          <button
            onClick={() => {
              setSearchParams({});
              setSearchQuery('');
            }}
            className="mt-4 text-primary-600 font-medium hover:text-primary-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
