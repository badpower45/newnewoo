import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, ToggleLeft, ToggleRight, Navigation, Link2, Package, DollarSign, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { api } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

interface BranchStats {
  branchId: number;
  branchName: string;
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  totalValue: number;
  averagePrice: number;
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
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestBranch, setNearestBranch] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);

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

  useEffect(() => { 
    load(); 
    loadBranchStats();
    detectUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && branches.length > 0) {
      findNearestBranch();
    }
  }, [userLocation, branches]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Detect user's current location
  const detectUserLocation = () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  // Find nearest branch to user
  const findNearestBranch = () => {
    if (!userLocation) return;
    
    let nearest: number | null = null;
    let minDistance = Infinity;
    
    branches.forEach(branch => {
      if (branch.latitude && branch.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          branch.latitude,
          branch.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = branch.id;
        }
      }
    });
    
    setNearestBranch(nearest);
  };

  // Load statistics for all branches
  const loadBranchStats = async () => {
    setStatsLoading(true);
    try {
      const stats: BranchStats[] = [];
      
      for (const branch of branches) {
        try {
          const response = await fetch(`${API_URL}/branch-products/all-branches?branchId=${branch.id}`);
          const data = await response.json();
          const products = Array.isArray(data?.data) ? data.data : [];
          
          const totalProducts = products.length;
          const totalStock = products.reduce((sum: number, p: any) => sum + (p.stock_quantity || 0), 0);
          const lowStockProducts = products.filter((p: any) => (p.stock_quantity || 0) < 10).length;
          const totalValue = products.reduce((sum: number, p: any) => 
            sum + ((p.price || 0) * (p.stock_quantity || 0)), 0
          );
          const averagePrice = totalProducts > 0 ? 
            products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / totalProducts : 0;
          
          stats.push({
            branchId: branch.id,
            branchName: branch.name_ar || branch.name,
            totalProducts,
            totalStock,
            lowStockProducts,
            totalValue,
            averagePrice
          });
        } catch (err) {
          console.error(`Error loading stats for branch ${branch.id}:`, err);
        }
      }
      
      setBranchStats(stats);
    } catch (error) {
      console.error('Error loading branch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

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
      await loadBranchStats();
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

  const getBranchStats = (branchId: number) => {
    return branchStats.find(s => s.branchId === branchId);
  };

  const getBranchDistance = (branch: Branch) => {
    if (!userLocation || !branch.latitude || !branch.longitude) return null;
    return calculateDistance(userLocation.lat, userLocation.lng, branch.latitude, branch.longitude);
  };

  const totalOverallProducts = branchStats.reduce((sum, s) => sum + s.totalProducts, 0);
  const totalOverallStock = branchStats.reduce((sum, s) => sum + s.totalStock, 0);
  const totalOverallValue = branchStats.reduce((sum, s) => sum + s.totalValue, 0);
  const activeBranches = branches.filter(b => b.is_active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الفروع</h1>
          <p className="text-sm text-gray-500 mt-1">
            {branches.length} فرع إجمالي • {activeBranches} فرع نشط
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowDashboard(!showDashboard)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Activity size={18} />
            {showDashboard ? 'عرض الجدول' : 'عرض اللوحة'}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus size={18} /> فرع جديد
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      {showDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">إجمالي الفروع</p>
                <h3 className="text-3xl font-bold text-blue-900 mt-1">{branches.length}</h3>
                <p className="text-xs text-blue-600 mt-1">{activeBranches} نشط</p>
              </div>
              <MapPin className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">إجمالي المنتجات</p>
                <h3 className="text-3xl font-bold text-green-900 mt-1">{totalOverallProducts}</h3>
                <p className="text-xs text-green-600 mt-1">في جميع الفروع</p>
              </div>
              <Package className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">إجمالي المخزون</p>
                <h3 className="text-3xl font-bold text-purple-900 mt-1">{totalOverallStock.toLocaleString()}</h3>
                <p className="text-xs text-purple-600 mt-1">وحدة</p>
              </div>
              <TrendingUp className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">إجمالي القيمة</p>
                <h3 className="text-3xl font-bold text-orange-900 mt-1">
                  {totalOverallValue.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}
                </h3>
                <p className="text-xs text-orange-600 mt-1">جنيه مصري</p>
              </div>
              <DollarSign className="text-orange-600" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Dashboard View */}
      {showDashboard ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => {
            const stats = getBranchStats(branch.id);
            const distance = getBranchDistance(branch);
            const isNearest = nearestBranch === branch.id;

            return (
              <div 
                key={branch.id} 
                className={`bg-white rounded-xl shadow-md border-2 hover:shadow-xl transition-all ${
                  isNearest ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                }`}
              >
                {/* Branch Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{branch.name_ar || branch.name}</h3>
                      <p className="text-sm text-gray-500">{branch.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNearest && (
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          الأقرب لك
                        </div>
                      )}
                      <button 
                        onClick={() => toggleActive(branch)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          branch.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {branch.is_active ? 'نشط' : 'غير نشط'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-xs">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-xs" dir="ltr">{branch.phone}</span>
                    </div>
                    {distance && (
                      <div className="flex items-center gap-2">
                        <Navigation size={14} className="text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          {distance.toFixed(1)} كم منك
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                {stats && (
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">المنتجات</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">المخزون</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalStock.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">القيمة</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(stats.totalValue / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">متوسط السعر</p>
                        <p className="text-xl font-bold text-gray-900">
                          {stats.averagePrice.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {stats.lowStockProducts > 0 && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-600" />
                        <span className="text-xs text-orange-700 font-medium">
                          {stats.lowStockProducts} منتج ناقص مخزون
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => openEdit(branch)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    <Edit size={16} />
                    تعديل
                  </button>
                  {branch.google_maps_link && (
                    <a 
                      href={branch.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                    >
                      <Link2 size={16} />
                      الخريطة
                    </a>
                  )}
                  <button 
                    onClick={() => remove(branch.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Address</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Phone</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Products</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Stock</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Active</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map(b => {
                const stats = getBranchStats(b.id);
                const distance = getBranchDistance(b);
                const isNearest = nearestBranch === b.id;

                return (
                  <tr key={b.id} className={`hover:bg-gray-50 ${isNearest ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{b.name}</p>
                        <p className="text-sm text-gray-500">{b.name_ar}</p>
                        {isNearest && (
                          <span className="text-xs text-green-600 font-medium">الأقرب لك</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm">{b.address}</span>
                      </div>
                      {distance && (
                        <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <Navigation size={12} />
                          {distance.toFixed(1)} كم
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-sm" dir="ltr">{b.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {stats ? (
                        <div>
                          <p className="font-semibold text-gray-900">{stats.totalProducts}</p>
                          {stats.lowStockProducts > 0 && (
                            <p className="text-xs text-orange-600">{stats.lowStockProducts} ناقص</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {stats ? (
                        <p className="font-semibold text-gray-900">{stats.totalStock.toLocaleString()}</p>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive(b)} className="flex items-center gap-1 text-sm">
                        {b.is_active ? <ToggleRight className="text-green-600" /> : <ToggleLeft className="text-gray-400" />}
                        <span>{b.is_active ? 'نشط' : 'غير نشط'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => remove(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
            const stats = getBranchStats(branch.id);
            const distance = getBranchDistance(branch);
            const isNearest = nearestBranch === branch.id;

            return (
              <div 
                key={branch.id} 
                className={`bg-white rounded-xl shadow-md border-2 hover:shadow-xl transition-all ${
                  isNearest ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                }`}
              >
                {/* Branch Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{branch.name_ar || branch.name}</h3>
                      <p className="text-sm text-gray-500">{branch.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNearest && (
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          الأقرب لك
                        </div>
                      )}
                      <button 
                        onClick={() => toggleActive(branch)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          branch.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {branch.is_active ? 'نشط' : 'غير نشط'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-xs">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-xs" dir="ltr">{branch.phone}</span>
                    </div>
                    {distance && (
                      <div className="flex items-center gap-2">
                        <Navigation size={14} className="text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          {distance.toFixed(1)} كم منك
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                {stats && (
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">المنتجات</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">المخزون</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalStock.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">القيمة</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(stats.totalValue / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500">متوسط السعر</p>
                        <p className="text-xl font-bold text-gray-900">
                          {stats.averagePrice.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {stats.lowStockProducts > 0 && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-600" />
                        <span className="text-xs text-orange-700 font-medium">
                          {stats.lowStockProducts} منتج ناقص مخزون
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => openEdit(branch)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    <Edit size={16} />
                    تعديل
                  </button>
                  {branch.google_maps_link && (
                    <a 
                      href={branch.google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                    >
                      <Link2 size={16} />
                      الخريطة
                    </a>
                  )}
                  <button 
                    onClick={() => remove(branch.id)}
                    className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (lus size={18} /> New Branch
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
