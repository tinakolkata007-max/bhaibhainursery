import { useState, useEffect } from 'react';
import { Tag, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';
import { useSettings } from '@/context/SettingsContext';

export default function OffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    supabase
      .from('coupons')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const now = new Date();
        const valid = (data || []).filter((c) => {
          if (c.start_date && new Date(c.start_date) > now) return false;
          if (c.end_date && new Date(c.end_date) < now) return false;
          if (c.usage_limit && c.used_count >= c.usage_limit) return false;
          return true;
        });
        setCoupons(valid);
        setLoading(false);
      });
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-secondary-600 font-semibold">Save More</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Offers & Discounts</h1>
        <p className="text-gray-500 mt-3">Use these coupon codes at checkout to save on your plant orders.</p>
      </div>

      {settings?.free_delivery_threshold ? (
        <div className="bg-primary-50 rounded-2xl p-5 mb-8 text-center">
          <p className="text-sm text-primary-700 font-medium">Free delivery on orders above {settings.currency_symbol}{settings.free_delivery_threshold}!</p>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20"><Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No active offers right now. Check back soon!</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-2xl border-2 border-dashed border-secondary-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-secondary-500 text-white p-4 flex items-center gap-3">
                <Tag className="w-6 h-6" />
                <div>
                  <p className="font-bold text-lg">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `${settings?.currency_symbol}${coupon.discount_value} OFF`}</p>
                  {coupon.description && <p className="text-xs text-white/80">{coupon.description}</p>}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <code className="text-sm font-mono font-bold text-gray-800 tracking-wider">{coupon.code}</code>
                  <button onClick={() => copyCode(coupon.code)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors">
                    {copied === coupon.code ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  {coupon.min_order_amount > 0 && <p>Min order: {settings?.currency_symbol}{coupon.min_order_amount}</p>}
                  {coupon.max_discount_amount && <p>Max discount: {settings?.currency_symbol}{coupon.max_discount_amount}</p>}
                  {coupon.end_date && <p>Valid until: {new Date(coupon.end_date).toLocaleDateString('en-IN')}</p>}
                  {coupon.usage_limit && <p>Limited to {coupon.usage_limit} uses</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-accent-50 rounded-2xl p-5 text-center">
        <p className="text-sm text-accent-700">Prices and discounts in WhatsApp messages are estimates until the store confirms your order.</p>
      </div>
    </div>
  );
}
