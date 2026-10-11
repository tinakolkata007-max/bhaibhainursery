import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ProductReview } from '@/types';

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('product_reviews').select('*, product:products(name)').order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const approve = async (id: string) => {
    await supabase.from('product_reviews').update({ approved: true }).eq('id', id);
    loadReviews();
  };

  const unapprove = async (id: string) => {
    await supabase.from('product_reviews').update({ approved: false }).eq('id', id);
    loadReviews();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('product_reviews').delete().eq('id', id);
    loadReviews();
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h1>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending Approval' : 'Approved'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No reviews found.</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">{review.customer_name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{review.customer_name}</p>
                      <p className="text-xs text-gray-400">{review.product?.name} - {new Date(review.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex mb-2">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-accent-400 fill-accent-400' : 'text-gray-200'}`} />)}</div>
                  {review.review_text && <p className="text-sm text-gray-600">{review.review_text}</p>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${review.approved ? 'bg-success-100 text-success-700' : 'bg-accent-100 text-accent-700'}`}>{review.approved ? 'Approved' : 'Pending'}</span>
                  <div className="flex gap-1">
                    {!review.approved && <button onClick={() => approve(review.id)} className="p-2 rounded-lg hover:bg-success-50 text-gray-500 hover:text-success-600" title="Approve"><Check className="w-4 h-4" /></button>}
                    {review.approved && <button onClick={() => unapprove(review.id)} className="p-2 rounded-lg hover:bg-accent-50 text-gray-500 hover:text-accent-600" title="Unapprove"><X className="w-4 h-4" /></button>}
                    <button onClick={() => remove(review.id)} className="p-2 rounded-lg hover:bg-error-50 text-gray-500 hover:text-error-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


