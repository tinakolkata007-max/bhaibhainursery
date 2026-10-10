import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader2, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';

export default function ProductsManager({ onStatsRefresh }: { onStatsRefresh: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }, []);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCategory || p.category_id === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    loadProducts();
    onStatsRefresh();
  };

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id);
    if (error) {
      setError(error.message);
      return;
    }
    loadProducts();
    onStatsRefresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Manage Products</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && (
        <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3 border border-error-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="py-3 px-4 rounded-xl border border-gray-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">SKU</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Stock</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{product.sku}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">₹{product.price}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={product.stock <= 0 ? 'text-error-600 font-medium' : product.stock <= 5 ? 'text-accent-600' : 'text-gray-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.active
                            ? 'bg-success-100 text-success-700 hover:bg-success-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(product); setShowForm(true); }}
                          className="p-2 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-error-50 text-gray-500 hover:text-error-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { loadProducts(); onStatsRefresh(); setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category_id: product?.category_id || categories[0]?.id || '',
    price: product?.price?.toString() || '',
    discount: product?.discount?.toString() || '0',
    stock: product?.stock?.toString() || '0',
    description: product?.description || '',
    images: product?.images?.join('\n') || '',
    featured: product?.featured || false,
    active: product?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const images = form.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (images.length === 0) {
      setError('Please add at least one image URL');
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      sku: form.sku,
      category_id: form.category_id || null,
      price: parseFloat(form.price) || 0,
      discount: parseFloat(form.discount) || 0,
      stock: parseInt(form.stock) || 0,
      description: form.description,
      images,
      featured: form.featured,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (product) {
      result = await supabase.from('products').update(payload).eq('id', product.id);
    } else {
      result = await supabase.from('products').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3 border border-error-100">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line) *</label>
            <textarea
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              rows={3}
              placeholder="https://images.pexels.com/photos/..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none font-mono text-xs"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-600"
              />
              Featured Product
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded accent-primary-600"
              />
              Active (visible in store)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
