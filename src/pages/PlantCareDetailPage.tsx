import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Sun, Droplets, FlaskConical, AlertCircle, ArrowLeft, Calendar } from 'lucide-react';
import type { PlantCareArticle } from '@/types';

export default function PlantCareDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<PlantCareArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    supabase
      .from('plant_care_articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        setArticle(data);
        setLoading(false);
      });
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Article not found.</p>
        <Link to="/plant-care" className="mt-4 inline-block text-primary-600 font-medium hover:text-primary-700">Back to Plant Care Guides</Link>
      </div>
    );
  }

  const careCards = [
    { icon: Droplets, title: 'Watering', content: article.watering_advice },
    { icon: Sun, title: 'Sunlight', content: article.sunlight_guidance },
    { icon: FlaskConical, title: 'Soil & Fertilizer', content: article.soil_fertilizer_advice },
    { icon: AlertCircle, title: 'Common Problems', content: article.common_problems },
  ].filter((c) => c.content);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/plant-care" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6"><ArrowLeft className="w-4 h-4" /> All Guides</Link>

      {article.cover_image && (
        <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-8">
          <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {article.category && <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">{article.category}</span>}
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">{article.title}</h1>
      {article.published_at && (
        <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-6"><Calendar className="w-4 h-4" />{new Date(article.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      )}

      <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed mb-8 whitespace-pre-line">{article.content}</div>

      {careCards.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {careCards.map((card) => (
            <div key={card.title} className="bg-primary-50/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center"><card.icon className="w-4 h-4 text-primary-600" /></div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{card.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
