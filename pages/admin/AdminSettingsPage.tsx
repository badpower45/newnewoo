import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Settings, Store, Boxes, Package, Users, ArrowRight } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ branches: 0, products: 0, users: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [branchesRes, productsRes, usersRes] = await Promise.all([
          api.branches.getAll(),
          api.products.getAll(),
          api.users.getAll()
        ]);
        const branches = branchesRes.data || branchesRes || [];
        const products = productsRes.data || productsRes || [];
        const users = usersRes.data || usersRes || [];
        setCounts({ branches: branches.length, products: products.length, users: users.length });
      } catch (e) {
        // fallback: keep zeros
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings size={22} /> Admin Settings</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <Store className="text-brand-orange" />
          <div>
            <div className="text-gray-500 text-sm">Branches</div>
            <div className="text-xl font-semibold">{loading ? '—' : counts.branches}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <Package className="text-brand-orange" />
          <div>
            <div className="text-gray-500 text-sm">Products</div>
            <div className="text-xl font-semibold">{loading ? '—' : counts.products}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <Users className="text-brand-orange" />
          <div>
            <div className="text-gray-500 text-sm">Users</div>
            <div className="text-xl font-semibold">{loading ? '—' : counts.users}</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link to="/admin/branches" className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <span className="flex items-center gap-2"><Store size={18}/> Manage Branches</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/admin/inventory" className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <span className="flex items-center gap-2"><Boxes size={18}/> Branch Inventory</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/admin/slots" className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <span className="flex items-center gap-2"><Settings size={18}/> Delivery Slots</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/admin/products" className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <span className="flex items-center gap-2"><Package size={18}/> Products</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/admin/orders" className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <span className="flex items-center gap-2"><Boxes size={18}/> Orders</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Basic App Config placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">App Configuration</h2>
        <div className="text-sm text-gray-600">Basic settings coming soon (branding, fees, thresholds).</div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
