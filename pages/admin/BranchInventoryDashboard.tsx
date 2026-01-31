import React, { useEffect, useState } from 'react';
import { Store, Package, AlertCircle, TrendingUp, DollarSign, Navigation, MapPin, Phone, Edit, Trash2, Plus, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { API_URL } from '../../src/config';

interface Branch {
  id: number;
  name: string;
  name_ar?: string;
  address: string;
  phone: string;
  google_maps_link?: string;
  latitude?: number;
  longitude?: number;
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

const BranchInventoryDashboard: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearestBranch, setNearestBranch] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    loadBranches();
    detectUserLocation();
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      loadBranchStats();
      if (userLocation) {
        findNearestBranch();
      }
    }
  }, [branches, userLocation]);

  const loadBranches = async () => {
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

  const loadBranchStats = async () => {
    setStatsLoading(true);
    try {
      const stats: BranchStats[] = [];
      
      for (const branch of branches) {
        try {
          const response = await fetch(`${API_URL}/branch-products/all-branches?branchId=${branch.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          console.log(`📊 Branch ${branch.id} data:`, data);
          
          // Handle the response format from API
          const products = Array.isArray(data?.data) ? data.data : [];
          
          let totalProducts = 0;
          let totalStock = 0;
          let lowStockProducts = 0;
          let totalValue = 0;
          let totalPrice = 0;
          
          // Each product has branches array
          products.forEach((item: any) => {
            const branchData = item.branches?.[0]; // Get first branch (should be current branch)
            if (branchData) {
              totalProducts++;
              const stock = branchData.stock_quantity || 0;
              const price = branchData.price || 0;
              
              totalStock += stock;
              totalValue += price * stock;
              totalPrice += price;
              
              if (stock < 10) {
                lowStockProducts++;
              }
            }
          });
          
          const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;
          
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 إحصائيات ومخزون الفروع</h1>
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
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">إجمالي الفروع</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-1">{branches.length}</h3>
              <p className="text-xs text-blue-600 mt-1">{activeBranches} نشط</p>
            </div>
            <Store className="text-blue-600" size={40} />
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
                {(totalOverallValue / 1000).toFixed(0)}k
              </h3>
              <p className="text-xs text-orange-600 mt-1">جنيه مصري</p>
            </div>
            <DollarSign className="text-orange-600" size={40} />
          </div>
        </div>
      </div>

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
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        branch.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {branch.is_active ? 'نشط' : 'غير نشط'}
                      </div>
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
                {stats ? (
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
                ) : (
                  <div className="p-6 bg-gray-50">
                    <div className="text-center text-gray-400">
                      <Package size={32} className="mx-auto mb-2" />
                      <p className="text-sm">جاري تحميل الإحصائيات...</p>
                    </div>
                  </div>
                )}
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
                <th className="px-6 py-4 font-semibold text-gray-600">الفرع</th>
                <th className="px-6 py-4 font-semibold text-gray-600">العنوان</th>
                <th className="px-6 py-4 font-semibold text-gray-600">المنتجات</th>
                <th className="px-6 py-4 font-semibold text-gray-600">المخزون</th>
                <th className="px-6 py-4 font-semibold text-gray-600">القيمة</th>
                <th className="px-6 py-4 font-semibold text-gray-600">الحالة</th>
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
                        <p className="font-medium text-gray-900">{b.name_ar || b.name}</p>
                        <p className="text-sm text-gray-500">{b.name}</p>
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
                    <td className="px-6 py-4">
                      {stats ? (
                        <div>
                          <p className="font-semibold text-gray-900">{stats.totalProducts}</p>
                          {stats.lowStockProducts > 0 && (
                            <p className="text-xs text-orange-600">{stats.lowStockProducts} ناقص</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {stats ? (
                        <p className="font-semibold text-gray-900">{stats.totalStock.toLocaleString()}</p>
                      ) : (
                        <span className="text-gray-400">...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {stats ? (
                        <p className="font-semibold text-gray-900">{(stats.totalValue / 1000).toFixed(1)}k ج.م</p>
                      ) : (
                        <span className="text-gray-400">...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        b.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {b.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchInventoryDashboard;
