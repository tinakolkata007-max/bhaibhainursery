import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice, getDiscountedPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const currency = settings?.currency_symbol || '₹';
  const deliveryCharge = settings?.delivery_charge || 0;

  return (
    <>
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] animate-fade-in"
          onClick={() => setCartOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl transition-transform duration-300 flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-serif text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            Your Cart
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-primary-300" />
            </div>
            <p className="text-gray-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add some beautiful plants to get started!</p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Plants
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item) => {
                const price = getDiscountedPrice(item.product);
                return (
                  <div key={item.product.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">{formatPrice(price, currency)} each</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(price * item.quantity, currency)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-error-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={clearCart}
                className="text-sm text-gray-400 hover:text-error-500 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Clear cart
              </button>
            </div>

            <div className="border-t border-gray-100 p-5 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal, currency)}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className="font-medium">{formatPrice(deliveryCharge, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(subtotal + deliveryCharge, currency)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="block w-full py-3.5 bg-primary-600 text-white text-center rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
