import React, { useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Store,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Grid3x3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import axios from 'axios';

// Use the same API URL as the rest of the app (configured in src/config.ts)
const API_URL = import.meta.env.VITE_API_URL || 'https://bkaa.vercel.app/api';

interface DashboardStats {
  total_products: number;
  total_branches: number;
  total_stock: number;
  total_reserved: number;
  total_available: number;
  out_of_stock_count: number;
  low_stock_count: number;
  good_stock_count: number;
  total_inventory_value: number;
}

interface AlertStats {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
}

interface Transaction {
  transaction_type: string;
  quantity: number;
  created_at: string;
  product_name: string;
  location_name: string;
}

interface BranchAnalytics {
  branch_id: number;
  branch_name: string;
  city: string;
  total_products: number;
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
  out_of_stock_count: number;
  low_stock_count: number;
  inventory_value: number;
}

interface CategoryAnalytics {
  category: string;
  total_products: number;
  total_stock: number;
  available_stock: number;
  out_of_stock_count: number;
  low_stock_count: number;
  avg_price: number;
  inventory_value: number;
}

interface HighDemandProduct {
  id: number;
  name: string;
  barcode: string;
  category: string;
  order_count: number;
  total_sold: number;
  avg_quantity_per_order: number;
  total_revenue: number;
  current_stock: number;
  stock_status: string;
  days_of_stock_remaining: number;
}

const AdminInventoryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AlertStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([]);
  const [highDemand, setHighDemand] = useState<HighDemandProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'categories' | 'demand'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // API_URL already includes /api, so we don't need to add it again
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
      
      const [dashboardRes, branchRes, categoryRes, demandRes] = await Promise.all([
        axios.get(`${baseUrl}/inventory/analytics/dashboard`, config),
        axios.get(`${baseUrl}/inventory/analytics/by-branch`, config),
        axios.get(`${baseUrl}/inventory/analytics/by-category`, config),
        axios.get(`${baseUrl}/inventory/analytics/high-demand?days=30&limit=20`, config)
      ]);

      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.data.statistics);
        setAlerts(dashboardRes.data.data.alerts);
        setTransactions(dashboardRes.data.data.recent_transactions);
      }

      if (branchRes.data.success) {
        setBranchAnalytics(branchRes.data.data);
      }

      if (categoryRes.data.success) {
        setCategoryAnalytics(categoryRes.data.data);
      }

      if (demandRes.data.success) {
        setHighDemand(demandRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', { 
      style: 'currency', 
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ar-EG').format(value);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
      case 'LOW_STOCK':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM_STOCK':
        return 'text-yellow-600 bg-yellow-50';
      case 'GOOD_STOCK':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم المخزون</h1>
          <p className="text-gray-600">إدارة ومراقبة المخزون عبر جميع الفروع</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_products)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatNumber(stats.total_branches)} فرع</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي المخزون</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_stock)}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {formatNumber(stats.total_available)} متاح
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">قيمة المخزون</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_inventory_value)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(stats.total_reserved)} محجوز
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">التنبيهات</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts?.total_alerts || 0}</p>
                  <div className="flex gap-2 mt-1">
                    {alerts && alerts.critical_alerts > 0 && (
                      <span className="text-xs text-red-600">{alerts.critical_alerts} حرجة</span>
                    )}
                    {alerts && alerts.high_alerts > 0 && (
                      <span className="text-xs text-orange-600">{alerts.high_alerts} عالية</span>
                    )}
                  </div>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Status Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">منتجات نفذت</h3>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{formatNumber(stats.out_of_stock_count)}</p>
              <p className="text-sm text-gray-600 mt-1">يحتاج إلى إعادة توريد</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">مخزون منخفض</h3>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{formatNumber(stats.low_stock_count)}</p>
              <p className="text-sm text-gray-600 mt-1">قريب من النفاد</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">مخزون جيد</h3>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{formatNumber(stats.good_stock_count)}</p>
              <p className="text-sm text-gray-600 mt-1">كمية كافية</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'branches'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                تحليل الفروع
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'categories'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                تحليل التصنيفات
              </button>
              <button
                onClick={() => setActiveTab('demand')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'demand'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                الأكثر طلباً
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">آخر المعاملات</h2>
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'IN' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.transaction_type === 'IN' ? (
                            <ArrowUpRight className={`w-4 h-4 ${
                              transaction.transaction_type === 'IN' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.product_name}</p>
                          <p className="text-sm text-gray-600">{transaction.location_name}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-semibold ${
                          transaction.transaction_type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'IN' ? '+' : '-'}{transaction.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Branches Tab */}
            {activeTab === 'branches' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">تحليل المخزون حسب الفروع</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفرع</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدينة</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتجات</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتاح</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نفذ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قيمة المخزون</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {branchAnalytics.map((branch) => (
                        <tr key={branch.branch_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Store className="w-5 h-5 text-gray-400 ml-2" />
                              <span className="font-medium text-gray-900">{branch.branch_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{branch.city}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(branch.total_products)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(branch.total_stock)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {formatNumber(branch.available_stock)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {formatNumber(branch.out_of_stock_count)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(branch.inventory_value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">تحليل المخزون حسب التصنيفات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryAnalytics.map((category, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Grid3x3 className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">{category.category || 'غير مصنف'}</h3>
                        </div>
                        <span className="text-sm text-gray-600">{formatNumber(category.total_products)} منتج</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">إجمالي المخزون</p>
                          <p className="text-lg font-bold text-gray-900">{formatNumber(category.total_stock)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">المتاح</p>
                          <p className="text-lg font-bold text-green-600">{formatNumber(category.available_stock)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">نفذ من المخزون</p>
                          <p className="text-lg font-bold text-red-600">{formatNumber(category.out_of_stock_count)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">قيمة المخزون</p>
                          <p className="text-lg font-bold text-purple-600">
                            {formatCurrency(category.inventory_value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Demand Tab */}
            {activeTab === 'demand' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">المنتجات الأكثر طلباً (آخر 30 يوم)</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الطلبات</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون الحالي</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">أيام التغطية</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {highDemand.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.barcode}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(product.order_count)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
                              <span className="text-sm font-semibold text-gray-900">
                                {formatNumber(product.total_sold)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              getStockStatusColor(product.stock_status)
                            }`}>
                              {formatNumber(product.current_stock)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(product.total_revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.days_of_stock_remaining ? 
                              `${product.days_of_stock_remaining} يوم` : 
                              'غير محدد'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventoryDashboard;
