import { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Loader2, X, History } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, InventoryMovement } from '@/types';

export default function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'history'>('overview');
  const [showAdjust, setShowAdjust] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from('products').select('*, category:categories(*)').order('name');
    setProducts(data || []);
    setLoading(false);
  }, []);

  const loadMovements = useCallback(async () => {
    const { data } = await supabase.from('inventory_movements').select('*, product:products(name, sku)').order('created_at', { ascending: false }).limit(50);
    setMovements(data || []);
  }, []);

  useEffect(() => { loadProducts(); loadMovements(); }, [loadProducts, loadMovements]);

  const filtered = products.filter((p) => {
    if (filter === 'low') return p.stock > 0 && p.stock <= p.low_stock_threshold;
    if (filter === 'out') return p.stock <= 0;
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold).length;
  const outStockCount = products.filter((p) => p.stock <= 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-6">Inventory Management</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'text-primary-600 bg-primary-50' },
          { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-accent-600 bg-accent-50' },
          { label: 'Out of Stock', value: outStockCount, icon: TrendingDown, color: 'text-error-600 bg-error-50' },
          { label: 'Stock Value', value: `₹${totalStockValue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-success-600 bg-success-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'overview' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Stock Overview</button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'history' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Movement History</button>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="flex gap-2 mb-4">
            {(['all', 'low', 'out'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                {f === 'all' ? 'All Products' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">SKU</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Threshold</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{p.stock}</td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.low_stock_threshold}</td>
                        <td className="px-4 py-3">
                          {p.stock <= 0 ? <span className="px-2 py-0.5 rounded-full text-xs bg-error-100 text-error-600 font-medium">Out of Stock</span>
                          : p.stock <= p.low_stock_threshold ? <span className="px-2 py-0.5 rounded-full text-xs bg-accent-100 text-accent-700 font-medium">Low Stock</span>
                          : <span className="px-2 py-0.5 rounded-full text-xs bg-success-100 text-success-700 font-medium">In Stock</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setShowAdjust(p)} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors">Adjust</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {movements.length === 0 ? (
            <div className="text-center py-12"><History className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-400">No inventory movements recorded yet.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr><th className="px-4 py-3 font-semibold text-gray-600">Product</th><th className="px-4 py-3 font-semibold text-gray-600">Type</th><th className="px-4 py-3 font-semibold text-gray-600">Qty</th><th className="px-4 py-3 font-semibold text-gray-600">Reason</th><th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{m.product?.name || 'Unknown'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.movement_type === 'stock_in' ? 'bg-success-100 text-success-700' : m.movement_type === 'stock_out' ? 'bg-error-100 text-error-600' : 'bg-accent-100 text-accent-700'}`}>{m.movement_type.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3 font-bold text-gray-900">{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{m.reason || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAdjust && <AdjustStockModal product={showAdjust} onClose={() => setShowAdjust(null)} onSaved={() => { loadProducts(); loadMovements(); setShowAdjust(null); }} />}
    </div>
  );
}

function AdjustStockModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity) || 0;
    if (qty === 0) return;
    setSaving(true);

    let newStock = product.stock;
    if (type === 'stock_in') newStock = product.stock + qty;
    else if (type === 'stock_out') newStock = Math.max(0, product.stock - qty);
    else newStock = qty;

    const delta = newStock - product.stock;

    await supabase.from('inventory_movements').insert({
      product_id: product.id,
      movement_type: type,
      quantity: delta,
      reason,
      previous_stock: product.stock,
      new_stock: newStock,
    });
    await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-gray-500">Current stock: <span className="font-bold text-gray-900">{product.stock}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm bg-white">
              <option value="stock_in">Stock In (add)</option>
              <option value="stock_out">Stock Out (remove)</option>
              <option value="adjustment">Set Exact Quantity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., New shipment, damaged, correction" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" />
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors">{saving ? 'Saving...' : 'Save Adjustment'}</button>
        </form>
      </div>
    </div>
  );
}
