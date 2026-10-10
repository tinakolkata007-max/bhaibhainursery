import { useState, useEffect, useCallback } from 'react';
import { Loader2, ShoppingBag, Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    loadOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_pincode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{order.customer_phone}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{order.total}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border-0 outline-none cursor-pointer font-medium ${
                          order.status === 'pending' ? 'bg-accent-100 text-accent-700' :
                          order.status === 'confirmed' ? 'bg-success-100 text-success-700' :
                          order.status === 'delivered' ? 'bg-primary-100 text-primary-700' :
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-serif text-xl font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Customer</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedOrder.customer_phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Address</p>
                  <p className="text-gray-700 mt-1">{selectedOrder.customer_address}, {selectedOrder.customer_pincode}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-900">₹{((item.product.price - (item.product.price * item.product.discount) / 100) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.delivery_charge > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>₹{selectedOrder.delivery_charge}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
