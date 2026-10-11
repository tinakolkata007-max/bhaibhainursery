import type { Product } from '@/types';

export function formatPrice(price: number, symbol = '₹'): string {
  return `${symbol}${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getDiscountedPrice(product: Product): number {
  return product.price - (product.price * product.discount) / 100;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  city?: string;
  state?: string;
  delivery_instructions?: string;
}

export function generateWhatsAppMessage(
  items: { product: Product; quantity: number }[],
  customer: CustomerInfo,
  subtotal: number,
  deliveryCharge: number,
  total: number,
  currencySymbol: string,
  orderRef?: string,
  couponCode?: string,
  couponDiscount?: number,
): string {
  let message = `Hello! I would like to place an order.\n\n`;
  if (orderRef) {
    message += `*Order Ref:* ${orderRef}\n\n`;
  }
  message += `*Order Details:*\n`;
  items.forEach((item, idx) => {
    const finalPrice = getDiscountedPrice(item.product);
    message += `${idx + 1}. ${item.product.name} (SKU: ${item.product.sku})\n`;
    message += `   Qty: ${item.quantity} x ${formatPrice(finalPrice, currencySymbol)} = ${formatPrice(finalPrice * item.quantity, currencySymbol)}\n`;
  });
  message += `\n*Subtotal:* ${formatPrice(subtotal, currencySymbol)}\n`;
  if (couponCode && couponDiscount && couponDiscount > 0) {
    message += `*Coupon (${couponCode}):* -${formatPrice(couponDiscount, currencySymbol)}\n`;
  }
  if (deliveryCharge > 0) {
    message += `*Delivery:* ${formatPrice(deliveryCharge, currencySymbol)}\n`;
  }
  message += `*Total:* ${formatPrice(total, currencySymbol)}\n\n`;
  message += `*Customer Details:*\n`;
  message += `Name: ${customer.name}\n`;
  message += `Phone: ${customer.phone}\n`;
  message += `Address: ${customer.address}\n`;
  if (customer.city) message += `City: ${customer.city}\n`;
  if (customer.state) message += `State: ${customer.state}\n`;
  message += `PIN: ${customer.pincode}\n`;
  if (customer.delivery_instructions) message += `Instructions: ${customer.delivery_instructions}\n`;
  message += `\nPlease confirm this order. Thank you!`;
  return message;
}

export function getWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function generateOrderRef(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GHN-${ymd}-${random}`;
}
