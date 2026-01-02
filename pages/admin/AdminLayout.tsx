import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Upload, MessageCircle, Store, CalendarClock, ClipboardList, Truck, Tag, Menu, X, BookOpen, Flame, CircleDot, FolderTree, Facebook, Gift, FileSpreadsheet, LayoutGrid, Briefcase, BarChart3, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if user has access to admin panel
    useEffect(() => {
        if (user && !['admin', 'manager', 'distributor', 'returns_manager'].includes(user.role || '')) {
            // Redirect unauthorized users (delivery goes to /delivery, others to home)
            if (user.role === 'delivery') {
                navigate('/delivery');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    // Define menu sections with role-based access control
    const menuSections = [
        {
            title: '📊 الإحصائيات',
            items: [
                { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', roles: ['admin', 'manager'] },
                { path: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'تحليلات العملاء', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: '📦 إدارة المنتجات',
            items: [
                { path: '/admin/products', icon: <Package size={20} />, label: 'المنتجات', roles: ['admin', 'manager'] },
                { path: '/admin/categories', icon: <FolderTree size={20} />, label: 'التصنيفات', roles: ['admin', 'manager'] },
                { path: '/admin/brands', icon: <Briefcase size={20} />, label: 'إدارة البراندات', roles: ['admin', 'manager'] },
                { path: '/admin/product-importer', icon: <FileSpreadsheet size={20} />, label: 'استيراد Excel', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: '🛒 الطلبات والتوزيع',
            items: [
                { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'الطلبات', roles: ['admin', 'manager'] },
                { path: '/admin/distribution', icon: <ClipboardList size={20} />, label: 'توزيع الطلبات', roles: ['admin', 'manager', 'distributor'] },
                { path: '/admin/returns', icon: <RotateCcw size={20} />, label: 'المرتجعات الذكية', roles: ['admin', 'manager', 'returns_manager'] },
            ]
        },
        {
            title: '🏪 الفروع والمخزون',
            items: [
                { path: '/admin/branches', icon: <Store size={20} />, label: 'الفروع', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: '🎁 العروض والتسويق',
            items: [
                { path: '/admin/magazine', icon: <BookOpen size={20} />, label: 'مجلة العروض', roles: ['admin', 'manager'] },
                { path: '/admin/hot-deals', icon: <Flame size={20} />, label: 'العروض الساخنة', roles: ['admin', 'manager'] },
                { path: '/admin/brand-offers', icon: <Gift size={20} />, label: 'عروض البراندات', roles: ['admin', 'manager'] },
                { path: '/admin/coupons', icon: <Tag size={20} />, label: 'الكوبونات', roles: ['admin', 'manager'] },
                { path: '/admin/category-banners', icon: <LayoutGrid size={20} />, label: 'بانرات التصنيفات', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: '📱 المحتوى التفاعلي',
            items: [
                { path: '/admin/stories', icon: <CircleDot size={20} />, label: 'الاستوريز', roles: ['admin', 'manager'] },
                { path: '/admin/facebook-reels', icon: <Facebook size={20} />, label: 'الريلز', roles: ['admin', 'manager'] },
                { path: '/admin/home-sections', icon: <LayoutGrid size={20} />, label: 'أقسام الرئيسية', roles: ['admin', 'manager'] },
                { path: '/admin/hero-sections', icon: <LayoutGrid size={20} />, label: 'Hero Sections', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: '👥 الموظفين والتوصيل',
            items: [
                { path: '/admin/employees', icon: <Users size={20} />, label: 'الموظفين', roles: ['admin'] },
                { path: '/admin/delivery-staff', icon: <Truck size={20} />, label: 'موظفي التوصيل', roles: ['admin', 'manager'] },
            ]
        },
        {
            title: '⚙️ النظام',
            items: [
                { path: '/admin/chat', icon: <MessageCircle size={20} />, label: 'الدردشة', roles: ['admin'] },
                { path: '/admin/settings', icon: <Settings size={20} />, label: 'الإعدادات', roles: ['admin'] },
            ]
        },
    ];

    // Filter menu items based on user role
    const userRole = user?.role || 'customer';
    const filteredSections = menuSections.map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(userRole))
    })).filter(section => section.items.length > 0);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-lg font-bold text-brand-brown">علوش Admin</h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 right-0 z-50
                w-64 bg-white shadow-md flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4 lg:p-6 border-b">
                    <h1 className="text-xl lg:text-2xl font-bold text-brand-brown">علوش Admin</h1>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">مرحباً، {user?.name || 'Guest'}</p>
                </div>
                <nav className="flex-1 p-2 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
                    {filteredSections.map((section, idx) => (
                        <div key={idx} className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-colors ${isActive(item.path)
                                            ? 'bg-brand-orange text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="font-medium text-sm lg:text-base">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
                <div className="p-2 lg:p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm lg:text-base">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
