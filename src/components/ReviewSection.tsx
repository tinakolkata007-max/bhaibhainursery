import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ProductReview } from '@/types';

export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', rating: 5, review_text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('product_reviews').insert({
      product_id: productId,
      customer_name: form.customer_name,
      rating: form.rating,
      review_text: form.review_text,
      approved: false,
    });
    setSubmitting(false);
    setSubmitted(true);
    setForm({ customer_name: '', rating: 5, review_text: '' });
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4" /> Write a Review
        </button>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-accent-400 fill-accent-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)} out of 5</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3 animate-slide-up">
          {submitted ? (
            <div className="text-center py-4 text-success-600 font-medium">
              Thank you! Your review has been submitted and will appear after approval.
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your name *"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  required
                  className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Rating:</span>
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                      <Star className={`w-6 h-6 ${s <= form.rating ? 'text-accent-400 fill-accent-400' : 'text-gray-200'} hover:scale-110 transition-transform`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Share your experience with this plant..."
                value={form.review_text}
                onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
              />
              <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
              </button>
              <p className="text-xs text-gray-400">Reviews are moderated and will appear after approval by our team.</p>
            </>
          )}
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review this plant!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.customer_name}</p>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-accent-400 fill-accent-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              {review.review_text && <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
