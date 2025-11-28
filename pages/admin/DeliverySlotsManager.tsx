import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';

interface Branch { id: number; name: string; }
interface Slot {
  id?: number;
  branch_id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  max_orders?: number;
  delivery_fee?: number;
  is_active?: boolean;
}

const todayISO = () => new Date().toISOString().slice(0,10);

const DeliverySlotsManager: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [date, setDate] = useState<string>(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<Slot | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      const res = await api.branches.getAll();
      const list = res.data || res || [];
      setBranches(list);
      if (!selectedBranchId && list.length) setSelectedBranchId(list[0].id);
    };
    loadBranches();
  }, []);

  const loadSlots = async () => {
    if (!selectedBranchId) { setSlots([]); return; }
    const res = await api.deliverySlots.getByBranch(selectedBranchId, date);
    setSlots(res.data || res || []);
  };

  useEffect(() => { loadSlots(); }, [selectedBranchId, date]);

  const addNew = () => {
    if (!selectedBranchId) return;
    setNewSlot({ branch_id: selectedBranchId, date, start_time: '10:00', end_time: '12:00', max_orders: 20, delivery_fee: 20, is_active: true });
  };

  const saveNew = async () => {
    if (!newSlot) return;
    setSaving(true);
    try {
      await api.deliverySlots.create({
        branchId: newSlot.branch_id,
        date: newSlot.date,
        startTime: newSlot.start_time,
        endTime: newSlot.end_time,
        maxOrders: newSlot.max_orders,
        deliveryFee: newSlot.delivery_fee,
        isActive: newSlot.is_active
      });
      setNewSlot(null);
      await loadSlots();
    } finally {
      setSaving(false);
    }
  };

  const updateSlot = async (s: Slot) => {
    if (!s.id) return;
    setSaving(true);
    try {
      await api.deliverySlots.update(s.id, {
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        maxOrders: s.max_orders,
        deliveryFee: s.delivery_fee,
        isActive: s.is_active
      });
      await loadSlots();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Delete this slot?')) return;
    await api.deliverySlots.delete(id);
    await loadSlots();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Slots</h1>
        <div className="flex items-center gap-3">
          <select value={selectedBranchId ?? ''} onChange={e=>setSelectedBranchId(Number(e.target.value))} className="border rounded-lg px-3 py-2">
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
            <Calendar size={16} className="text-gray-500" />
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="outline-none" />
          </div>
          <button onClick={addNew} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus size={16}/> New Slot</button>
        </div>
      </div>

      <div className="space-y-4">
        {newSlot && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="font-semibold">New Slot</span>
              <input type="time" value={newSlot.start_time} onChange={e=>setNewSlot({...newSlot, start_time:e.target.value})} className="border rounded px-2 py-1" />
              <span>to</span>
              <input type="time" value={newSlot.end_time} onChange={e=>setNewSlot({...newSlot, end_time:e.target.value})} className="border rounded px-2 py-1" />
              <input type="number" value={newSlot.max_orders ?? 20} onChange={e=>setNewSlot({...newSlot, max_orders:Number(e.target.value)})} className="w-24 border rounded px-2 py-1" placeholder="Max" />
              <input type="number" value={newSlot.delivery_fee ?? 20} onChange={e=>setNewSlot({...newSlot, delivery_fee:Number(e.target.value)})} className="w-24 border rounded px-2 py-1" placeholder="Fee" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!newSlot.is_active} onChange={e=>setNewSlot({...newSlot, is_active:e.target.checked})}/> Active</label>
              <button onClick={saveNew} disabled={saving} className="ml-auto flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"><Save size={16}/> Save</button>
            </div>
          </div>
        )}

        {slots.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-3 items-center">
              <Clock size={16} className="text-gray-500" />
              <input type="time" value={s.start_time} onChange={e=>setSlots(prev=>prev.map(x=>x.id===s.id?{...x,start_time:e.target.value}:x))} className="border rounded px-2 py-1" />
              <span>to</span>
              <input type="time" value={s.end_time} onChange={e=>setSlots(prev=>prev.map(x=>x.id===s.id?{...x,end_time:e.target.value}:x))} className="border rounded px-2 py-1" />
              <input type="number" value={s.max_orders ?? 20} onChange={e=>setSlots(prev=>prev.map(x=>x.id===s.id?{...x,max_orders:Number(e.target.value)}:x))} className="w-24 border rounded px-2 py-1" placeholder="Max" />
              <input type="number" value={s.delivery_fee ?? 20} onChange={e=>setSlots(prev=>prev.map(x=>x.id===s.id?{...x,delivery_fee:Number(e.target.value)}:x))} className="w-24 border rounded px-2 py-1" placeholder="Fee" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!s.is_active} onChange={e=>setSlots(prev=>prev.map(x=>x.id===s.id?{...x,is_active:e.target.checked}:x))}/> Active</label>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={()=>updateSlot(s)} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"><Save size={16}/></button>
                <button onClick={()=>remove(s.id)} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliverySlotsManager;
