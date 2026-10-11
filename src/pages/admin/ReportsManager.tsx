import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, IndianRupee, ShoppingBag, Users, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

type DateRange = 'today' | '7d' | '30d' | 'all';

export default function ReportsManager() {
  const [range, setRange] = useState<DateRange>('30d');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*');
    if (range === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      query = query.gte('created_at', start.toISOString());
    } else if (range === '7d' || range === '30d') {
      const start = new Date(); start.setDate(start.getDate() - (range === '7d' ? 7 : 30));
      query = query.gte('created_at', start.toISOString());
    }
    const { data } = await query.order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, [range]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending_confirmation').length;
  const confirmedCount = orders.filter((o) => ['confirmed', 'packed', 'shipped', 'delivered'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const topProducts: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.items) {
      o.items.forEach((item: any) => {
        topProducts[item.name] = (topProducts[item.name] || 0) + item.quantity;
      });
    }
  });
  const sortedProducts = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const dailyRevenue: Record<string, number> = {};
  orders.forEach((o) => {
    const day = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    dailyRevenue[day] = (dailyRevenue[day] || 0) + o.total;
  });
  const sortedDays = Object.entries(dailyRevenue).slice(-7);
  const maxDailyRevenue = Math.max(...sortedDays.map(([, v]) => v), 1);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900">Sales Reports</h1>
        <div className="flex gap-2">
          {(['today', '7d', '30d', 'all'] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${range === r ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success-600 bg-success-50' },
              { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'text-primary-600 bg-primary-50' },
              { label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(0)}`, icon: TrendingUp, color: 'text-accent-600 bg-accent-50' },
              { label: 'Delivered', value: deliveredCount, icon: Calendar, color: 'text-secondary-600 bg-secondary-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-serif font-bold text-gray-900 mb-4">Daily Revenue (last 7 days)</h3>
              <div className="space-y-3">
                {sortedDays.length === 0 ? <p className="text-gray-400 text-sm">No data in this range.</p> : sortedDays.map(([day, value]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{day}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div className="bg-primary-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(value / maxDailyRevenue) * 100}%` }}>
                        <span className="text-[10px] text-white font-medium">₹{value.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-serif font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
                {Object.keys(statusCounts).length === 0 && <p className="text-gray-400 text-sm">No orders in this range.</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-serif font-bold text-gray-900 mb-4">Top Selling Products</h3>
            {sortedProducts.length === 0 ? <p className="text-gray-400 text-sm">No product sales in this range.</p> : (
              <div className="space-y-2">
                {sortedProducts.map(([name, qty], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{name}</span>
                    <span className="text-sm font-bold text-gray-900">{qty} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Pending', value: pendingCount, color: 'text-accent-600' },
              { label: 'Confirmed', value: confirmedCount, color: 'text-primary-600' },
              { label: 'Delivered', value: deliveredCount, color: 'text-success-600' },
              { label: 'Cancelled', value: cancelledCount, color: 'text-error-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
