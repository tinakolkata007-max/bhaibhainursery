import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, MessageCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice, getDiscountedPrice, generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const currency = settings?.currency_symbol || '₹';
  const deliveryCharge = settings?.delivery_charge || 0;
  const total = subtotal + deliveryCharge;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.phone.trim()) e.phone = 'Please enter your phone number';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.address.trim()) e.address = 'Please enter your delivery address';
    if (!form.pincode.trim()) e.pincode = 'Please enter your PIN code';
    else if (!/^\d{6}$/.test(form.pincode.replace(/\D/g, ''))) e.pincode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      await supabase.from('orders').insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        customer_pincode: form.pincode,
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        subtotal,
        delivery_charge: deliveryCharge,
        total,
        status: 'pending',
      });
    } catch {
      // Order recording is optional - proceed to WhatsApp even if it fails
    }

    const message = generateWhatsAppMessage(
      items,
      form,
      subtotal,
      deliveryCharge,
      total,
      currency
    );

    const whatsappUrl = getWhatsAppUrl(settings?.whatsapp_number || '919999999999', message);
    window.open(whatsappUrl, '_blank');

    setSubmitting(false);
    setSuccess(true);
    clearCart();

    setTimeout(() => {
      navigate('/');
    }, 5000);
  };

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-primary-300" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some plants before checking out!</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          Browse Plants
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">
          WhatsApp should have opened with your order details. Please review and send the message to confirm your order.
        </p>
        <p className="text-sm text-gray-400">Redirecting you home...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>

      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Delivery Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-error-500' : 'border-gray-200'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-xs text-error-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-error-500' : 'border-gray-200'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm`}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-xs text-error-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-error-500' : 'border-gray-200'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none`}
                placeholder="House number, street, area, city, state"
              />
              {errors.address && <p className="text-xs text-error-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                maxLength={6}
                className={`w-full px-4 py-3 rounded-xl border ${errors.pincode ? 'border-error-500' : 'border-gray-200'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm`}
                placeholder="560001"
              />
              {errors.pincode && <p className="text-xs text-error-500 mt-1">{errors.pincode}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1da851] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Preparing order...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" /> Send Order via WhatsApp
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Clicking this button opens WhatsApp with your order details. Please review and send the message to complete your order.
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => {
              const price = getDiscountedPrice(item.product);
              return (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatPrice(price, currency)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(price * item.quantity, currency)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            {deliveryCharge > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>{formatPrice(deliveryCharge, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
