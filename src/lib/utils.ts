import type { Product } from '@/types';

export function formatPrice(price: number, symbol = '₹'): string {
  return `${symbol}${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getDiscountedPrice(product: Product): number {
  return product.price - (product.price * product.discount) / 100;
}

export function generateWhatsAppMessage(
  items: { product: Product; quantity: number }[],
  customer: { name: string; phone: string; address: string; pincode: string },
  subtotal: number,
  deliveryCharge: number,
  total: number,
  currencySymbol: string
): string {
  let message = `Hello ${customer.name}! Thank you for shopping with us.\n\n`;
  message += `*Order Details:*\n`;
  items.forEach((item, idx) => {
    const finalPrice = getDiscountedPrice(item.product);
    message += `${idx + 1}. ${item.product.name} (SKU: ${item.product.sku})\n`;
    message += `   Qty: ${item.quantity} × ${formatPrice(finalPrice, currencySymbol)} = ${formatPrice(finalPrice * item.quantity, currencySymbol)}\n`;
  });
  message += `\n*Subtotal:* ${formatPrice(subtotal, currencySymbol)}\n`;
  if (deliveryCharge > 0) {
    message += `*Delivery:* ${formatPrice(deliveryCharge, currencySymbol)}\n`;
  }
  message += `*Total:* ${formatPrice(total, currencySymbol)}\n\n`;
  message += `*Customer Details:*\n`;
  message += `Name: ${customer.name}\n`;
  message += `Phone: ${customer.phone}\n`;
  message += `Address: ${customer.address}\n`;
  message += `PIN: ${customer.pincode}\n\n`;
  message += `Please confirm this order. Thank you!`;
  return message;
}

export function getWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
