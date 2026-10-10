import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, FolderTree } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in it will remain but become uncategorized.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    loadCategories();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Manage Categories</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {error && (
        <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3 border border-error-100 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No categories yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Slug</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Order</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell font-mono text-xs">{cat.slug}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell truncate max-w-[200px]">{cat.description}</td>
                    <td className="px-4 py-3 text-gray-600">{cat.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(cat); setShowForm(true); }}
                          className="p-2 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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
        <CategoryForm
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { loadCategories(); setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    display_order: category?.display_order?.toString() || '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const payload = {
      name: form.name,
      slug,
      description: form.description,
      display_order: parseInt(form.display_order) || 0,
    };

    let result;
    if (category) {
      result = await supabase.from('categories').update(payload).eq('id', category.id);
    } else {
      result = await supabase.from('categories').insert(payload);
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
      <div className="bg-white rounded-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'Add Category'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL identifier)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : category ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
