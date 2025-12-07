import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Search, Save, Edit2, Download, Upload } from 'lucide-react';

interface Branch { id: number; name: string; }

interface BranchProduct {
  branch_id: number;
  product_id: number;
  product_name?: string;
  branch_price?: number;
  stock_quantity?: number;
  reserved_quantity?: number;
}

const BranchInventory: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [items, setItems] = useState<BranchProduct[]>([]);
  const [filter, setFilter] = useState('');
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

  useEffect(() => {
    const load = async () => {
      if (!selectedBranchId) { setItems([]); return; }
      const res = await api.branchProducts.getByBranch(selectedBranchId);
      const list = res.data || res || [];
      setItems(list);
    };
    load();
  }, [selectedBranchId]);

  const onChange = (pid: number, field: 'branch_price' | 'stock_quantity', value: number) => {
    setItems(prev => prev.map(i => (i.product_id === pid ? { ...i, [field]: value } as any : i)));
  };

  const toShow = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return items;
    return items.filter(i => (i.product_name || '').toLowerCase().includes(f));
  }, [filter, items]);

  const saveItem = async (bp: BranchProduct) => {
    if (!selectedBranchId) return;
    setSaving(true);
    try {
      await api.branchProducts.update(selectedBranchId, bp.product_id, {
        branchPrice: bp.branch_price,
        stockQuantity: bp.stock_quantity
      });
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (!items.length) return;
    const headers = ['product_id', 'product_name', 'branch_price', 'stock_quantity', 'reserved_quantity'];
    const rows = items.map(i => [
      i.product_id,
      i.product_name || '',
      i.branch_price ?? 0,
      i.stock_quantity ?? 0,
      i.reserved_quantity ?? 0
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branch_${selectedBranchId}_inventory.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBranchId) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    const updates = lines.slice(1).map(line => {
      const [pid, , , qty] = line.split(',');
      return { branchId: selectedBranchId, productId: parseInt(pid), stockQuantity: parseInt(qty) };
    });
    try {
      await api.branchProducts.bulkUpdateStock(updates);
      const res = await api.branchProducts.getByBranch(selectedBranchId);
      setItems(res.data || res || []);
      alert('Bulk update successful');
    } catch (err) {
      alert('Bulk update failed');
      console.error(err);
    }
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branch Inventory</h1>
        <div className="flex items-center gap-3">
          <select value={selectedBranchId ?? ''} onChange={e=>setSelectedBranchId(Number(e.target.value))} className="border rounded-lg px-3 py-2">
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={exportCSV} disabled={!items.length} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Download size={18} />
            Export CSV
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
            <Upload size={18} />
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-gray-600 font-semibold">Product</th>
              <th className="px-6 py-3 text-gray-600 font-semibold">Branch Price</th>
              <th className="px-6 py-3 text-gray-600 font-semibold">Stock</th>
              <th className="px-6 py-3 text-gray-600 font-semibold">Reserved</th>
              <th className="px-6 py-3 text-gray-600 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {toShow.map((bp, index) => (
              <tr key={`${bp.branch_id}-${bp.product_id}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{bp.product_name || `#${bp.product_id}`}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Edit2 size={14} className="text-gray-400" />
                    <input type="number" value={bp.branch_price ?? 0} onChange={e=>onChange(bp.product_id, 'branch_price', Number(e.target.value))} className="w-28 border rounded px-2 py-1" />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <input type="number" value={bp.stock_quantity ?? 0} onChange={e=>onChange(bp.product_id, 'stock_quantity', Number(e.target.value))} className="w-24 border rounded px-2 py-1" />
                </td>
                <td className="px-6 py-3 text-gray-600">{bp.reserved_quantity ?? 0}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={()=>saveItem(bp)} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" disabled={saving}>
                    <Save size={16} /> Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchInventory;
