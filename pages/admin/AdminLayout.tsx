import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Upload, MessageCircle, Store, Boxes, CalendarClock, ClipboardList, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Check if user has access to admin panel
    useEffect(() => {
        if (user && !['admin', 'manager', 'distributor'].includes(user.role || '')) {
            // Redirect unauthorized users (delivery goes to /delivery, others to home)
            if (user.role === 'delivery') {
                navigate('/delivery');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    // Define menu items with role-based access control
    const allNavItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', roles: ['admin', 'manager'] },
        { path: '/admin/products', icon: <Package size={20} />, label: 'المنتجات', roles: ['admin', 'manager'] },
        { path: '/admin/upload', icon: <Upload size={20} />, label: 'رفع Excel', roles: ['admin', 'manager'] },
        { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'الطلبات', roles: ['admin', 'manager'] },
        { path: '/admin/distribution', icon: <ClipboardList size={20} />, label: 'توزيع الطلبات', roles: ['admin', 'manager', 'distributor'] },
        { path: '/admin/delivery-staff', icon: <Truck size={20} />, label: 'موظفي التوصيل', roles: ['admin', 'manager'] },
        { path: '/admin/branches', icon: <Store size={20} />, label: 'الفروع', roles: ['admin', 'manager'] },
        { path: '/admin/inventory', icon: <Boxes size={20} />, label: 'المخزون', roles: ['admin', 'manager'] },
        { path: '/admin/slots', icon: <CalendarClock size={20} />, label: 'مواعيد التوصيل', roles: ['admin', 'manager'] },
        { path: '/admin/employees', icon: <Users size={20} />, label: 'الموظفين', roles: ['admin'] },
        { path: '/admin/chat', icon: <MessageCircle size={20} />, label: 'الدردشة', roles: ['admin'] },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'الإعدادات', roles: ['admin'] },
    ];

    // Filter menu items based on user role
    const userRole = user?.role || 'customer';
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-brand-brown">Lumina Admin</h1>
                    <p className="text-sm text-gray-500">Welcome, {user?.name || 'Guest'}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive(item.path)
                                ? 'bg-brand-orange text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
