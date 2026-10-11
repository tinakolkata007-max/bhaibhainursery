import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DeliveryZone } from '@/types';

export default function DeliverySettingsManager() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);

  const loadZones = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('delivery_zones').select('*').order('zone_name');
    setZones(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this delivery zone?')) return;
    await supabase.from('delivery_zones').delete().eq('id', id);
    loadZones();
  };

  const toggleActive = async (z: DeliveryZone) => {
    await supabase.from('delivery_zones').update({ active: !z.active }).eq('id', z.id);
    loadZones();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm text-gray-500 mt-1">Set delivery charges for different areas.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"><Plus className="w-4 h-4" /> Add Zone</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
      ) : zones.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No delivery zones yet.</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Zone Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Pincodes</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Charge</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">ETA</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{z.zone_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{z.pincodes?.join(', ') || 'All'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{z.delivery_charge}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{z.estimated_days} days</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${z.active ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>{z.active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditing(z); setShowForm(true); }} className="p-2 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(z.id)} className="p-2 rounded-lg hover:bg-error-50 text-gray-500 hover:text-error-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && <ZoneForm zone={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { loadZones(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function ZoneForm({ zone, onClose, onSaved }: { zone: DeliveryZone | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    zone_name: zone?.zone_name || '',
    pincodes: zone?.pincodes?.join(', ') || '',
    delivery_charge: zone?.delivery_charge?.toString() || '0',
    estimated_days: zone?.estimated_days?.toString() || '3',
    free_above: zone?.free_above?.toString() || '',
    active: zone?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const pincodes = form.pincodes ? form.pincodes.split(',').map((p) => p.trim()).filter(Boolean) : [];

    const payload = {
      zone_name: form.zone_name,
      pincodes: pincodes.length > 0 ? pincodes : null,
      delivery_charge: parseFloat(form.delivery_charge) || 0,
      estimated_days: parseInt(form.estimated_days) || 3,
      free_above: form.free_above ? parseFloat(form.free_above) : null,
      active: form.active,
    };

    let result;
    if (zone) result = await supabase.from('delivery_zones').update(payload).eq('id', zone.id);
    else result = await supabase.from('delivery_zones').insert(payload);

    if (result.error) { setError(result.error.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-900">{zone ? 'Edit Zone' : 'Add Zone'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Zone Name *</label><input type="text" value={form.zone_name} onChange={(e) => setForm({ ...form, zone_name: e.target.value })} required placeholder="e.g., Local City, National" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincodes (comma separated)</label><input type="text" value={form.pincodes} onChange={(e) => setForm({ ...form, pincodes: e.target.value })} placeholder="e.g., 560001, 560002 (leave empty for all)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge ₹ *</label><input type="number" step="0.01" value={form.delivery_charge} onChange={(e) => setForm({ ...form, delivery_charge: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Days *</label><input type="number" value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Above ₹</label><input type="number" step="0.01" value={form.free_above} onChange={(e) => setForm({ ...form, free_above: e.target.value })} placeholder="No free delivery" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm" /></div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary-600" /> Active</label>
          <button type="submit" disabled={saving} className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300">{saving ? 'Saving...' : 'Save Zone'}</button>
        </form>
      </div>
    </div>
  );
}
