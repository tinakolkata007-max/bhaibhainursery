import { useState, useEffect } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import type { SiteSettings } from '@/types';

export default function SettingsManager() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('site_settings').update(form).eq('id', 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      refresh();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!settings) return <div className="text-center py-20 text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Store Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" value={form.store_name || ''} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                <input type="text" value={form.hero_title || ''} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                <input type="text" value={form.hero_subtitle || ''} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Text</label>
              <textarea value={form.about_text || ''} onChange={(e) => setForm({ ...form, about_text: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Bar Text</label>
              <input type="text" value={form.announcement_bar || ''} onChange={(e) => setForm({ ...form, announcement_bar: e.target.value || null })} placeholder="e.g., Free delivery on orders above Rs. 500!" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              <p className="text-xs text-gray-400 mt-1">Leave empty to hide the announcement bar.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
              <input type="text" value={form.business_hours || ''} onChange={(e) => setForm({ ...form, business_hours: e.target.value })} placeholder="Mon - Sat: 9 AM - 7 PM" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.store_open ?? true} onChange={(e) => setForm({ ...form, store_open: e.target.checked })} className="w-4 h-4 accent-primary-600" /> Store Open (accepting orders)
            </label>
          </div>
        </section>

        {/* WhatsApp & Delivery */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">WhatsApp & Delivery</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (with country code, no +)</label>
              <input type="text" value={form.whatsapp_number || ''} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="919999999999" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              <p className="text-xs text-gray-400 mt-1">Include country code. Example: 91 for India, followed by the number.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (Rs)</label>
                <input type="number" step="0.01" value={form.delivery_charge ?? 0} onChange={(e) => setForm({ ...form, delivery_charge: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input type="text" value={form.currency_symbol || ''} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Above (Rs)</label>
                <input type="number" step="0.01" value={form.free_delivery_threshold ?? 0} onChange={(e) => setForm({ ...form, free_delivery_threshold: parseFloat(e.target.value) || 0 })} placeholder="0 = no free delivery" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (Rs)</label>
                <input type="number" step="0.01" value={form.min_order_amount ?? 0} onChange={(e) => setForm({ ...form, min_order_amount: parseFloat(e.target.value) || 0 })} placeholder="0 = no minimum" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Payment Options */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Payment Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.cod_enabled ?? true} onChange={(e) => setForm({ ...form, cod_enabled: e.target.checked })} className="w-4 h-4 accent-primary-600" /> Cash on Delivery available
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.bank_transfer_enabled ?? false} onChange={(e) => setForm({ ...form, bank_transfer_enabled: e.target.checked })} className="w-4 h-4 accent-primary-600" /> Bank Transfer available
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Information (shown at checkout)</label>
              <textarea value={form.payment_info || ''} onChange={(e) => setForm({ ...form, payment_info: e.target.value || null })} rows={2} placeholder="e.g., Pay after confirmation via COD or bank transfer." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none" />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input type="email" value={form.contact_email || ''} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input type="text" value={form.contact_phone || ''} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input type="text" value={form.instagram_url || ''} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input type="text" value={form.facebook_url || ''} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Policy Pages */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Policy Pages Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy</label>
              <textarea value={form.privacy_policy || ''} onChange={(e) => setForm({ ...form, privacy_policy: e.target.value || null })} rows={4} placeholder="Your privacy policy text..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea value={form.terms_conditions || ''} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value || null })} rows={4} placeholder="Your terms and conditions..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping & Delivery Policy</label>
              <textarea value={form.shipping_policy || ''} onChange={(e) => setForm({ ...form, shipping_policy: e.target.value || null })} rows={4} placeholder="Your shipping policy..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return & Refund Policy</label>
              <textarea value={form.return_policy || ''} onChange={(e) => setForm({ ...form, return_policy: e.target.value || null })} rows={4} placeholder="Your return and refund policy..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-y" />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-5 h-5" /> Saved!</>
          ) : (
            <><Save className="w-5 h-5" /> Save Settings</>
          )}
        </button>
      </form>
    </div>
  );
}
