import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, MessageCircle, Loader2, Tag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice, getDiscountedPrice, generateWhatsAppMessage, getWhatsAppUrl, generateOrderRef } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const currency = settings?.currency_symbol || '₹';
  const deliveryCharge = settings?.delivery_charge || 0;
  const freeDeliveryThreshold = settings?.free_delivery_threshold || 0;
  const actualDeliveryCharge = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryCharge;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    delivery_instructions: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  const total = subtotal + actualDeliveryCharge - couponDiscount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.phone.trim()) e.phone = 'Please enter your phone number';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit phone number';
    if (!form.address.trim()) e.address = 'Please enter your delivery address';
    if (!form.city.trim()) e.city = 'Please enter your city';
    if (!form.state.trim()) e.state = 'Please enter your state';
    if (!form.pincode.trim()) e.pincode = 'Please enter your PIN code';
    else if (!/^\d{6}$/.test(form.pincode.replace(/\D/g, ''))) e.pincode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (!data) {
      setCouponError('Invalid or expired coupon code');
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    if (data.min_order_amount > 0 && subtotal < data.min_order_amount) {
      setCouponError(`Minimum order of ${formatPrice(data.min_order_amount, currency)} required`);
      return;
    }

    if (data.end_date && new Date(data.end_date) < new Date()) {
      setCouponError('This coupon has expired');
      return;
    }

    if (data.usage_limit && data.used_count >= data.usage_limit) {
      setCouponError('This coupon has reached its usage limit');
      return;
    }

    let discount = 0;
    if (data.discount_type === 'percentage') {
      discount = (subtotal * data.discount_value) / 100;
      if (data.max_discount_amount && discount > data.max_discount_amount) {
        discount = data.max_discount_amount;
      }
    } else {
      discount = data.discount_value;
    }
    setAppliedCoupon(data);
    setCouponDiscount(discount);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const ref = generateOrderRef();
    setOrderRef(ref);

    const orderItems = items.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      sku: i.product.sku,
      price: getDiscountedPrice(i.product),
      quantity: i.quantity,
      image: i.product.images[0],
    }));

    try {
      await supabase.from('orders').insert({
        order_ref: ref,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        customer_pincode: form.pincode,
        city: form.city,
        state: form.state,
        delivery_instructions: form.delivery_instructions || null,
        items: orderItems,
        subtotal,
        delivery_charge: actualDeliveryCharge,
        total,
        status: 'pending_confirmation',
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: couponDiscount,
      });

      if (appliedCoupon) {
        await supabase.from('coupons').update({ used_count: (appliedCoupon.used_count || 0) + 1 }).eq('id', appliedCoupon.id);
      }
    } catch {
      // Order recording failed - proceed to WhatsApp anyway
    }

    const message = generateWhatsAppMessage(
      items,
      form,
      subtotal,
      actualDeliveryCharge,
      total,
      currency,
      ref,
      appliedCoupon?.code,
      couponDiscount,
    );

    const whatsappUrl = getWhatsAppUrl(settings?.whatsapp_number || '919999999999', message);
    window.open(whatsappUrl, '_blank');

    setSubmitting(false);
    setSuccess(true);
    clearCart();
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
          Your order reference is <span className="font-mono font-bold text-primary-600">{orderRef}</span>
        </p>
        <p className="text-gray-500 mb-4">
          WhatsApp should have opened with your order details. Please review and send the message to confirm your order.
        </p>
        <p className="text-sm text-gray-400 mb-6">Your order status is <span className="font-medium text-accent-600">Pending Confirmation</span> until the store confirms it.</p>
        <Link to="/order-enquiry" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          Track Your Order
        </Link>
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
                placeholder="House number, street, area"
              />
              {errors.address && <p className="text-xs text-error-500 mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-error-500' : 'border-gray-200'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm`}
                  placeholder="Bangalore"
                />
                {errors.city && <p className="text-xs text-error-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.state ? 'border-error-500' : 'border-gray-200'} focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm`}
                  placeholder="Karnataka"
                />
                {errors.state && <p className="text-xs text-error-500 mt-1">{errors.state}</p>}
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions (optional)</label>
              <textarea
                value={form.delivery_instructions}
                onChange={(e) => setForm({ ...form, delivery_instructions: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
                placeholder="Any special delivery instructions..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1da851] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Preparing order...</>
              ) : (
                <><MessageCircle className="w-5 h-5" /> Send Order via WhatsApp</>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Clicking this button opens WhatsApp with your order details. Your order status will be "Pending Confirmation" until the store confirms it.
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
                      {item.quantity} x {formatPrice(price, currency)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(price * item.quantity, currency)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Coupon */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-success-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-700">{appliedCoupon.code} applied</span>
                </div>
                <button onClick={removeCoupon} className="p-1 rounded hover:bg-success-100">
                  <X className="w-4 h-4 text-success-600" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-error-500 mt-1">{couponError}</p>}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-success-600">
                <span>Coupon Discount</span>
                <span>-{formatPrice(couponDiscount, currency)}</span>
              </div>
            )}
            {actualDeliveryCharge > 0 ? (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>{formatPrice(actualDeliveryCharge, currency)}</span>
              </div>
            ) : freeDeliveryThreshold > 0 ? (
              <div className="flex justify-between text-sm text-success-600">
                <span>Delivery</span>
                <span>FREE</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="mt-4 bg-primary-50/50 rounded-xl p-3 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Payment</p>
            <p>No online payment required. Pay after order confirmation via Cash on Delivery or as arranged with the store.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
