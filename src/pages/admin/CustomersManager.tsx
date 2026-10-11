import { useState, useEffect, useCallback } from 'react';
import { Phone, Mail, MapPin, ShoppingBag, Loader2, Users, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types';

export default function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s);
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Customers</h1>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, or email..." className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No customers found.</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Orders</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Total Spent</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">{c.name?.charAt(0) || '?'}</div>
                        <span className="font-medium text-gray-900 truncate max-w-[150px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.city || '-'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{c.total_orders}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 hidden sm:table-cell">₹{c.total_spent?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-4 py-3 text-right"><span className="text-xs text-primary-600 font-medium">Details</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('orders').select('*').eq('customer_phone', customer.phone).order('created_at', { ascending: false });
      setOrders(data || []);
      setLoadingOrders(false);
    })();
  }, [customer.phone]);

  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-semibold text-primary-700">{customer.name?.charAt(0) || '?'}</div>
            <div><h2 className="font-serif text-lg font-bold text-gray-900">{customer.name}</h2><p className="text-xs text-gray-400">Customer since {new Date(customer.created_at).toLocaleDateString('en-IN')}</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{customer.phone}</span></div>
            {customer.email && <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{customer.email}</span></div>}
            {customer.city && <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-700">{customer.city}, {customer.state || ''}</span></div>}
          </div>

          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
            <div className="text-center"><p className="text-xl font-bold text-primary-600">{customer.total_orders}</p><p className="text-xs text-gray-500">Orders</p></div>
            <div className="text-center"><p className="text-xl font-bold text-success-600">₹{customer.total_spent?.toLocaleString('en-IN') || 0}</p><p className="text-xs text-gray-500">Spent</p></div>
            <div className="text-center"><p className="text-xl font-bold text-accent-600">{customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</p><p className="text-xs text-gray-500">Last Order</p></div>
          </div>

          {customer.address && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-400 mb-1">Default Address</p><p className="text-sm text-gray-700">{customer.address}</p></div>}

          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-gray-400" /> Order History</h3>
            {loadingOrders ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div> : orders.length === 0 ? <p className="text-sm text-gray-400">No orders found.</p> : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div><p className="text-sm font-mono font-medium text-gray-900">{o.order_ref}</p><p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-gray-900">₹{o.total}</p><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{o.status.replace(/_/g, ' ')}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

