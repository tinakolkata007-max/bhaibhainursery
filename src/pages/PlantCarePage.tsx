import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Calendar, ArrowRight, Sprout } from 'lucide-react';
import type { PlantCareArticle } from '@/types';

export default function PlantCarePage() {
  const [articles, setArticles] = useState<PlantCareArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useState(() => {
    supabase
      .from('plant_care_articles')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setArticles(data || []);
        setLoading(false);
      });
  });

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Knowledge Hub</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Plant Care Guides</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">Learn how to keep your plants healthy and thriving with our expert care guides and tips.</p>
      </div>

      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No articles found.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <Link key={article.id} to={`/plant-care/${article.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
              {article.cover_image && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                {article.category && <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">{article.category}</span>}
                <h2 className="font-serif text-lg font-semibold text-gray-900 mt-1 group-hover:text-primary-600 transition-colors">{article.title}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.content.slice(0, 120)}...</p>
                <div className="flex items-center justify-between mt-4">
                  {article.published_at && (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  )}
                  <span className="text-sm text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
