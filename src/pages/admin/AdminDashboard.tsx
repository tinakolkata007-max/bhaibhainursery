import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, LayoutDashboard, Package, Settings, ShoppingBag, FolderTree } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import ProductsManager from './ProductsManager';
import CategoriesManager from './CategoriesManager';
import SettingsManager from './SettingsManager';
import OrdersManager from './OrdersManager';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const { session, isAdmin, loading, signOut } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total: 0, active: 0, outOfStock: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const loadStats = useCallback(async () => {
    const [prodRes, orderRes] = await Promise.all([
      supabase.from('products').select('id, active, stock'),
      supabase.from('orders').select('id').order('created_at', { ascending: false }).limit(100),
    ]);
    const products = prodRes.data || [];
    setStats({
      total: products.length,
      active: products.filter((p: any) => p.active).length,
      outOfStock: products.filter((p: any) => p.stock <= 0).length,
      orders: orderRes.data?.length || 0,
    });
  }, []);

  const loadRecentOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentOrders(data || []);
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadRecentOrders();
    }
  }, [isAdmin, loadStats, loadRecentOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-primary-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-serif text-lg font-semibold block leading-tight">Green Haven</span>
            <span className="text-[10px] text-primary-300 uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 lg:flex-col flex flex-row overflow-x-auto lg:overflow-x-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-800'
              }`}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-800">
          <div className="text-xs text-primary-300 mb-2 truncate">{session?.user?.email}</div>
          <button
            onClick={() => signOut().then(() => navigate('/admin'))}
            className="flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {activeTab === 'overview' && (
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Products', value: stats.total, color: 'bg-primary-50 text-primary-700' },
                  { label: 'Active Products', value: stats.active, color: 'bg-success-50 text-success-700' },
                  { label: 'Out of Stock', value: stats.outOfStock, color: 'bg-error-50 text-error-600' },
                  { label: 'Total Orders', value: stats.orders, color: 'bg-secondary-50 text-secondary-700' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${stat.color} mb-3`}>
                      {stat.label}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">₹{order.total}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'pending' ? 'bg-accent-100 text-accent-700' :
                            order.status === 'confirmed' ? 'bg-success-100 text-success-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductsManager onStatsRefresh={loadStats} />}
          {activeTab === 'categories' && <CategoriesManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}
