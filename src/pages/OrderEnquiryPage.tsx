import { useState } from 'react';
import { Search, Loader2, Package, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/context/SettingsContext';
import { getWhatsAppUrl } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrderEnquiryPage() {
  const [orderRef, setOrderRef] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const { settings } = useSettings();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(false);

    if (!orderRef.trim()) {
      setError('Please enter an order reference number.');
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('order_ref', orderRef.trim())
      .maybeSingle();

    setSearched(true);
    if (data) {
      if (data.customer_phone && phone.trim() && data.customer_phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, ''))) {
        setOrder(data);
      } else if (!phone.trim()) {
        setError('Please also enter the phone number used when placing the order for verification.');
      } else {
        setError('The order reference and phone number do not match. Please check and try again.');
      }
    } else {
      setError('No order found with that reference number.');
    }
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    pending_confirmation: 'bg-accent-100 text-accent-700',
    confirmed: 'bg-primary-100 text-primary-700',
    processing: 'bg-primary-100 text-primary-700',
    packed: 'bg-primary-100 text-primary-700',
    shipped: 'bg-secondary-100 text-secondary-700',
    out_for_delivery: 'bg-secondary-100 text-secondary-700',
    delivered: 'bg-success-100 text-success-700',
    cancelled: 'bg-error-100 text-error-600',
    pending: 'bg-accent-100 text-accent-700',
  };

  const statusLabels: Record<string, string> = {
    pending_confirmation: 'Pending Confirmation',
    confirmed: 'Confirmed',
    processing: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    pending: 'Pending',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-primary-600 font-semibold">Track Your Order</span>
        <h1 className="font-serif text-3xl font-bold text-gray-900 mt-2">Order Enquiry</h1>
        <p className="text-gray-500 mt-3">Enter your order reference and phone number to check your order status.</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Reference *</label>
          <input type="text" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="e.g., GHN-XXXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (for verification)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone used when ordering" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> Check Status</>}
        </button>
      </form>

      {error && <div className="bg-error-50 text-error-600 text-sm rounded-xl p-4 mb-6">{error}</div>}

      {order && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><Package className="w-5 h-5 text-primary-600" /></div>
              <div>
                <p className="font-semibold text-gray-900">{order.order_ref}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-medium text-gray-900">{order.items?.length || 0} product(s)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-gray-900">{settings?.currency_symbol}{order.total}</span></div>
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">For detailed order information or changes, please contact us via WhatsApp.</p>
          <a href={getWhatsAppUrl(settings?.whatsapp_number || '', `Hello, I am enquiring about my order ${order.order_ref}.`)} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-3 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1da851] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" /> Enquire on WhatsApp
          </a>
        </div>
      )}

      {searched && !order && !error && (
        <div className="text-center py-8">
          <p className="text-gray-400">No order found. Please check your reference number.</p>
        </div>
      )}
    </div>
  );
}
