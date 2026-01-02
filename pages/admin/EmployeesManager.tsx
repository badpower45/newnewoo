import React, { useState, useEffect } from 'react';
import { Plus, User, Mail, Shield, Phone, Building, Filter, Search, Edit2, X, Truck, Headphones, Package, Users, Star, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

// تعريف الـ Roles مع الألوان والأيقونات
const ROLES: { [key: string]: { label: string; labelAr: string; color: string; bgColor: string; icon: any } } = {
    admin: { label: 'Admin', labelAr: 'مدير عام', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Shield },
    manager: { label: 'Manager', labelAr: 'مدير', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Users },
    employee: { label: 'Employee', labelAr: 'موظف خدمة عملاء', color: 'text-green-700', bgColor: 'bg-green-100', icon: Headphones },
    distributor: { label: 'Distributor', labelAr: 'موزع الطلبات', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Package },
    returns_manager: { label: 'Returns Manager', labelAr: 'موظف المرتجعات', color: 'text-red-700', bgColor: 'bg-red-100', icon: RotateCcw },
    customer: { label: 'Customer', labelAr: 'عميل', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: User },
};

const EmployeesManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'employee',
        phone: '',
        phone2: '',
        branchId: ''
    });
    const [filterRole, setFilterRole] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
        loadBranches();
    }, []);

    const loadUsers = () => {
        api.users.getAll().then(data => {
            if (data.data) setUsers(data.data);
        });
    };

    const loadBranches = () => {
        api.branches.getAll().then(data => {
            if (data.data) setBranches(data.data);
        });
    };

    // فلترة المستخدمين
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesSearch = !searchQuery || 
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    // إحصائيات سريعة
    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        managers: users.filter(u => u.role === 'manager').length,
        employees: users.filter(u => u.role === 'employee').length,
        distributors: users.filter(u => u.role === 'distributor').length,
        returns_managers: users.filter(u => u.role === 'returns_manager').length,
        delivery: users.filter(u => u.role === 'delivery').length,
        customers: users.filter(u => u.role === 'customer').length,
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData: any = {
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role
            };

            // إذا كان موزع، أضف الفرع
            if (newUser.role === 'distributor') {
                userData.branchId = newUser.branchId;
            }

            console.log('🔄 جاري إرسال البيانات للسيرفر:', userData);
            
            const response = await api.users.create(userData);
            
            console.log('📥 رد السيرفر:', response);
            
            if (response.error) {
                throw new Error(response.error);
            }
            
            alert('✅ تم إنشاء المستخدم بنجاح! ID: ' + response.userId);
            setShowAddModal(false);
            resetForm();
            loadUsers();
        } catch (err: any) {
            console.error("❌ فشل إنشاء المستخدم:", err);
            alert('❌ فشل إنشاء المستخدم: ' + (err.message || 'خطأ غير معروف - تأكد إن السيرفر شغال'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewUser({ 
            name: '', 
            email: '', 
            password: '', 
            role: 'employee',
            phone: '',
            phone2: '',
            branchId: ''
        });
        setEditingUser(null);
    };

    const getRoleInfo = (role: string) => {
        return ROLES[role] || ROLES.customer;
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">إدارة المستخدمين والموظفين</h1>
                    <p className="text-xs lg:text-sm text-gray-500 mt-1">إضافة وإدارة جميع أنواع المستخدمين</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 lg:px-5 py-2.5 lg:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg text-sm lg:text-base w-full sm:w-auto justify-center"
                >
                    <Plus size={18} />
                    <span>إضافة مستخدم جديد</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-3">
                <div className="bg-white rounded-xl p-3 lg:p-4 border shadow-sm">
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-[10px] lg:text-xs text-gray-500">الإجمالي</p>
                </div>
                {Object.entries(ROLES).map(([key, role]) => (
                    <button
                        key={key}
                        onClick={() => setFilterRole(filterRole === key ? 'all' : key)}
                        className={`rounded-xl p-2 lg:p-4 border shadow-sm transition text-right ${
                            filterRole === key ? 'ring-2 ring-primary' : ''
                        } ${role.bgColor}`}
                    >
                        <div className="flex items-center justify-between">
                            <role.icon size={14} className={`${role.color} hidden sm:block`} />
                            <p className={`text-base lg:text-xl font-bold ${role.color}`}>
                                {stats[key === 'employee' ? 'employees' : key === 'delivery' ? 'delivery' : `${key}s` as keyof typeof stats] || 0}
                            </p>
                        </div>
                        <p className="text-[10px] lg:text-xs text-gray-600 mt-1 truncate">{role.labelAr}</p>
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الإيميل..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">جميع الأدوار</option>
                    {Object.entries(ROLES).map(([key, role]) => (
                        <option key={key} value={key}>{role.labelAr}</option>
                    ))}
                </select>
            </div>

            {/* Users Table - Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">المستخدم</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">الإيميل</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">الدور</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">معلومات إضافية</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    لا يوجد مستخدمين
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const roleInfo = getRoleInfo(user.role);
                                const RoleIcon = roleInfo.icon;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleInfo.bgColor}`}>
                                                    <RoleIcon size={18} className={roleInfo.color} />
                                                </div>
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="text-sm">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${roleInfo.bgColor} ${roleInfo.color}`}>
                                                {roleInfo.labelAr}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.role === 'delivery' && user.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {user.phone}
                                                </div>
                                            )}
                                            {(user.role === 'distributor' || user.role === 'delivery') && user.assigned_branch_id && (
                                                <div className="flex items-center gap-1">
                                                    <Building size={12} />
                                                    {branches.find(b => b.id === user.assigned_branch_id)?.name || 'فرع غير معروف'}
                                                </div>
                                            )}
                                            {user.role === 'delivery' && user.average_rating > 0 && (
                                                <div className="flex items-center gap-1 text-yellow-600">
                                                    <Star size={12} className="fill-current" />
                                                    {parseFloat(user.average_rating).toFixed(1)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 justify-end text-xs text-gray-400">
                                                    لا يوجد إجراءات حذف
                                                </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Users Cards - Mobile */}
            <div className="lg:hidden space-y-3">
                {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                        لا يوجد مستخدمين
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const roleInfo = getRoleInfo(user.role);
                        const RoleIcon = roleInfo.icon;
                        return (
                            <div key={user.id} className="bg-white rounded-xl p-4 shadow-sm border">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleInfo.bgColor}`}>
                                            <RoleIcon size={18} className={roleInfo.color} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${roleInfo.bgColor} ${roleInfo.color}`}>
                                        {roleInfo.labelAr}
                                    </span>
                                </div>
                                {/* Extra Info */}
                                {(user.role === 'delivery' || user.role === 'distributor') && (
                                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 text-xs text-gray-500">
                                        {user.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone size={12} />
                                                {user.phone}
                                            </div>
                                        )}
                                        {user.assigned_branch_id && (
                                            <div className="flex items-center gap-1">
                                                <Building size={12} />
                                                {branches.find(b => b.id === user.assigned_branch_id)?.name || 'فرع'}
                                            </div>
                                        )}
                                        {user.average_rating > 0 && (
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <Star size={12} className="fill-current" />
                                                {parseFloat(user.average_rating).toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 lg:px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg lg:text-xl font-bold text-gray-900">إضافة مستخدم جديد</h2>
                            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            {/* Role Selection - First */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المستخدم</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(ROLES).map(([key, role]) => {
                                        const RoleIcon = role.icon;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNewUser({ ...newUser, role: key })}
                                                className={`p-3 rounded-xl border-2 transition text-center ${
                                                    newUser.role === key 
                                                        ? `border-primary ${role.bgColor}` 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <RoleIcon size={20} className={`mx-auto mb-1 ${role.color}`} />
                                                <p className="text-xs font-medium">{role.labelAr}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="أدخل الاسم الكامل"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="example@email.com"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Distributor-specific fields */}
                            {newUser.role === 'distributor' && (
                                <div className="p-4 bg-orange-50 rounded-xl space-y-4">
                                    <h3 className="font-medium text-orange-800 flex items-center gap-2">
                                        <Package size={18} />
                                        بيانات موزع الطلبات
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الفرع المسؤول عنه</label>
                                        <select
                                            required
                                            value={newUser.branchId}
                                            onChange={e => setNewUser({ ...newUser, branchId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">اختر الفرع</option>
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            جاري الإنشاء...
                                        </>
                                    ) : (
                                        'إنشاء المستخدم'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeesManager;
