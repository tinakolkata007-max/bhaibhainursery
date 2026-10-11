import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Tag, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    loadCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    loadCoupons();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No coupons yet.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{c.code}</code>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-error-50 text-gray-500 hover:text-error-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-lg font-bold text-primary-600">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</p>
              {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
              <div className="mt-3 space-y-1 text-xs text-gray-400">
                {c.min_order_amount > 0 && <p>Min order: ₹{c.min_order_amount}</p>}
                {c.end_date && <p>Expires: {new Date(c.end_date).toLocaleDateString('en-IN')}</p>}
                <p>Used: {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</p>
              </div>
              <button onClick={() => toggleActive(c)} className="mt-3 w-full py-2 text-xs font-medium rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">{c.active ? 'Deactivate' : 'Activate'}</button>
            </div>
          ))}
        </div>
      )}

      {showForm && <CouponForm coupon={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { loadCoupons(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function CouponForm({ coupon, onClose, onSaved }: { coupon: Coupon | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value?.toString() || '',
    min_order_amount: coupon?.min_order_amount?.toString() || '0',
    max_discount_amount: coupon?.max_discount_amount?.toString() || '',
    usage_limit: coupon?.usage_limit?.toString() || '',
    start_date: coupon?.start_date?.split('T')[0] || '',
    end_date: coupon?.end_date?.split('T')[0] || '',
    active: coupon?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      discount_type: form.discount_type as 'percentage' | 'fixed',
      discount_value: parseFloat(form.discount_value) || 0,
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      active: form.active,
    };

    let result;
    if (coupon) result = await supabase.from('coupons').update(payload).eq('id', coupon.id);
    else result = await supabase.from('coupons').insert(payload);

    if (result.error) { setError(result.error.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-serif text-xl font-bold text-gray-900">{coupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm font-mono uppercase" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type *</label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-white"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Value *</label><input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Order ₹</label><input type="number" step="0.01" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Discount ₹</label><input type="number" step="0.01" value={form.max_discount_amount} onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label><input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary-600" /> Active</label>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : coupon ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
