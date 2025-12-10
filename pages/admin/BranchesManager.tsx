import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, ToggleLeft, ToggleRight, Navigation, Link2 } from 'lucide-react';
import { api } from '../../services/api';

interface Branch {
  id: number;
  name: string;
  name_ar?: string;
  address: string;
  phone: string;
  google_maps_link?: string;
  latitude?: number;
  longitude?: number;
  delivery_radius?: number;
  is_active?: boolean;
}

const emptyBranch: Omit<Branch, 'id'> = {
  name: '',
  name_ar: '',
  address: '',
  phone: '',
  google_maps_link: '',
  latitude: undefined,
  longitude: undefined,
  delivery_radius: 10,
  is_active: true
};

const BranchesManager: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<Omit<Branch, 'id'>>(emptyBranch);
  const [locationInput, setLocationInput] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.branches.getAll();
      const list = Array.isArray((res as any)?.data ?? res) ? ((res as any).data ?? res) : [];
      setBranches(list);
    } catch (e) {
      console.error('Failed to load branches', e);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyBranch); setShowModal(true); };
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      name: b.name,
      name_ar: b.name_ar || '',
      address: b.address,
      phone: b.phone,
      google_maps_link: b.google_maps_link || '',
      latitude: b.latitude,
      longitude: b.longitude,
      delivery_radius: b.delivery_radius || 10,
      is_active: b.is_active ?? true
    });
    setLocationInput(b.google_maps_link || '');
    setShowModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.branches.update(editing.id, form);
      } else {
        await api.branches.create(form);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Saving branch failed');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this branch?')) return;
    try {
      await api.branches.delete(id);
      await load();
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  const toggleActive = async (b: Branch) => {
    try {
      await api.branches.update(b.id, { is_active: !b.is_active });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  // Get user's current location
  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setForm({ ...form, latitude: lat, longitude: lng });
        setLocationInput(`${lat}, ${lng}`);
        alert(`تم جلب موقعك بنجاح!\nLat: ${lat}\nLng: ${lng}`);
      },
      (error) => {
        alert(`خطأ في جلب الموقع: ${error.message}`);
      }
    );
  };

  // Parse location input (Google Maps URL or coordinates)
  const parseLocation = (input: string) => {
    if (!input.trim()) return;

    try {
      // Case 1: Direct coordinates "31.25906894945564, 32.292874702221496"
      if (/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(input.trim())) {
        const [lat, lng] = input.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          setForm({ ...form, latitude: lat, longitude: lng });
          return;
        }
      }

      // Case 2: Google Maps URL
      // https://maps.app.goo.gl/VgvAuC9hSuKvCWiQ7
      // https://www.google.com/maps?q=31.259069,32.292875
      // https://www.google.com/maps/@31.259069,32.292875,15z

      // Try to extract from @lat,lng pattern
      const atMatch = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (atMatch) {
        const lat = parseFloat(atMatch[1]);
        const lng = parseFloat(atMatch[2]);
        setForm({ ...form, latitude: lat, longitude: lng });
        setLocationInput(`${lat}, ${lng}`);
        return;
      }

      // Try to extract from ?q=lat,lng pattern
      const qMatch = input.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (qMatch) {
        const lat = parseFloat(qMatch[1]);
        const lng = parseFloat(qMatch[2]);
        setForm({ ...form, latitude: lat, longitude: lng });
        setLocationInput(`${lat}, ${lng}`);
        return;
      }

      // For shortened URLs like maps.app.goo.gl, we need to inform user
      if (input.includes('maps.app.goo.gl') || input.includes('goo.gl')) {
        alert('الرجاء فتح الرابط المختصر في المتصفح ونسخ الرابط الكامل الذي يحتوي على الإحداثيات');
        return;
      }

      alert('لم يتم التعرف على الصيغة. استخدم:\n- إحداثيات مباشرة: 31.259, 32.293\n- رابط Google Maps كامل يحتوي على @lat,lng');
    } catch (e) {
      alert('خطأ في تحليل الموقع');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus size={18} /> New Branch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Address</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Active</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {branches.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                <td className="px-6 py-4 text-gray-600 flex items-center gap-2"><MapPin size={16} className="text-gray-400" />{b.address}</td>
                <td className="px-6 py-4 text-gray-600 flex items-center gap-2"><Phone size={16} className="text-gray-400" />{b.phone}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleActive(b)} className="flex items-center gap-1 text-sm">
                    {b.is_active ? <ToggleRight className="text-green-600" /> : <ToggleLeft className="text-gray-400" />}
                    <span>{b.is_active ? 'Active' : 'Inactive'}</span>
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => remove(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Branch' : 'New Branch'}</h2>
            <form onSubmit={save} className="space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم بالعربي <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={form.name_ar} 
                    onChange={e=>setForm({...form, name_ar:e.target.value})} 
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="فرع المنصورة"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e=>setForm({...form, name:e.target.value})} 
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Mansoura Branch"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان <span className="text-red-500">*</span>
                </label>
                <textarea 
                  required 
                  value={form.address} 
                  onChange={e=>setForm({...form, address:e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="شارع الجمهورية، المنصورة، الدقهلية"
                  dir="rtl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="tel"
                  value={form.phone} 
                  onChange={e=>setForm({...form, phone:e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="+20 123 456 7890"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط Google Maps <span className="text-red-500">*</span>
                </label>
                <input 
                  required
                  type="url"
                  value={form.google_maps_link} 
                  onChange={e=>setForm({...form, google_maps_link:e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="https://maps.google.com/?q=31.0409,31.3785"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  📍 هذا الرابط سيستخدم لفتح الموقع في Google Maps
                </p>
              </div>

              {/* Location Input Section - Optional */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  الإحداثيات (اختياري - للمستقبل)
                </label>
                <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                  ℹ️ هذه الحقول اختيارية ويمكن استخدامها في المستقبل لتحديد موقع الفرع تلقائياً
                </p>

                {/* Manual Coordinate Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude (اختياري)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={form.latitude || ''}
                      onChange={e => setForm({...form, latitude: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="31.0409"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude (اختياري)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={form.longitude || ''}
                      onChange={e => setForm({...form, longitude: e.target.value ? Number(e.target.value) : undefined})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="31.3785"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Radius (km)</label>
                    <input
                      type="number"
                      value={form.delivery_radius}
                      onChange={e=>setForm({...form, delivery_radius: Number(e.target.value)})}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getMyLocation}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  <Navigation size={14} />
                  جلب موقعي الحالي
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={!!form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} />
                <label htmlFor="active" className="text-sm">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 border rounded-lg py-2">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white rounded-lg py-2">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesManager;
