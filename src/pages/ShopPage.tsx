import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [indoorOutdoor, setIndoorOutdoor] = useState('');
  const [sunlightFilter, setSunlightFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
    setCurrentPage(1);
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

    if (priceRange.min) {
      result = result.filter((p) => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter((p) => p.price <= parseFloat(priceRange.max));
    }

    if (indoorOutdoor) {
      result = result.filter((p) => p.indoor_outdoor === indoorOutdoor);
    }

    if (sunlightFilter) {
      result = result.filter((p) => p.sunlight?.toLowerCase().includes(sunlightFilter.toLowerCase()));
    }

    if (availabilityFilter === 'in_stock') {
      result = result.filter((p) => p.stock > 0);
    } else if (availabilityFilter === 'out_of_stock') {
      result = result.filter((p) => p.stock <= 0);
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
      case 'bestselling':
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, priceRange, indoorOutdoor, sunlightFilter, availabilityFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeCategoryName = categories.find((c) => c.slug === selectedCategory);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setIndoorOutdoor('');
    setSunlightFilter('');
    setAvailabilityFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory || searchQuery || priceRange.min || priceRange.max || indoorOutdoor || sunlightFilter || availabilityFilter;

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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl border text-sm transition-colors ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" /> Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-3 px-4 rounded-xl border border-gray-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
            <option value="bestselling">Best Selling</option>
          </select>
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
            <input type="number" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
            <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} placeholder="9999" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Indoor / Outdoor</label>
            <select value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white">
              <option value="">Any</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sunlight</label>
            <select value={sunlightFilter} onChange={(e) => setSunlightFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white">
              <option value="">Any</option>
              <option value="direct">Direct Sunlight</option>
              <option value="indirect">Indirect Light</option>
              <option value="shade">Shade</option>
              <option value="partial">Partial Sun</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
            <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white">
              <option value="">Any</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      )}

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
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 rounded-full text-sm text-gray-500 hover:text-error-500 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear all
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
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No plants found matching your filters.</p>
          <button onClick={clearAllFilters} className="mt-4 text-primary-600 font-medium hover:text-primary-700">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
