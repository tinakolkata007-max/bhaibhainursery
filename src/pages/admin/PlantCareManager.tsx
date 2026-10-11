import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PlantCareArticle } from '@/types';

export default function PlantCareManager() {
  const [articles, setArticles] = useState<PlantCareArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlantCareArticle | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('plant_care_articles').select('*').order('published_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await supabase.from('plant_care_articles').delete().eq('id', id);
    loadArticles();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Plant Care Articles</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" /> Add Article</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No articles yet.</p></div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              {a.image_url && <img src={a.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 truncate">{a.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${a.published ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{a.published ? 'Published' : 'Draft'}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{a.category} - {a.read_time} min read - {a.published_at ? new Date(a.published_at).toLocaleDateString('en-IN') : 'Unpublished'}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(a); setShowForm(true); }} className="p-2 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-error-50 text-gray-500 hover:text-error-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ArticleForm article={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { loadArticles(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function ArticleForm({ article, onClose, onSaved }: { article: PlantCareArticle | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    category: article?.category || 'Watering',
    image_url: article?.image_url || '',
    read_time: article?.read_time?.toString() || '5',
    published: article?.published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const payload = {
      title: form.title,
      slug,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      image_url: form.image_url || null,
      read_time: parseInt(form.read_time) || 5,
      published: form.published,
      published_at: article?.published_at || new Date().toISOString(),
    };

    let result;
    if (article) result = await supabase.from('plant_care_articles').update(payload).eq('id', article.id);
    else result = await supabase.from('plant_care_articles').insert(payload);

    if (result.error) { setError(result.error.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-xl font-bold text-gray-900">{article ? 'Edit Article' : 'Add Article'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-white"><option>Watering</option><option>Sunlight</option><option>Soil</option><option>Fertilizing</option><option>Pests</option><option>General</option><option>Seasonal</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Content *</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={10} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-mono text-xs resize-y" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Read Time (min)</label><input type="number" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-primary-600" /> Published</label>
          <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : article ? 'Save' : 'Publish'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
