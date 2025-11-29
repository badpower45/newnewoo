import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Phone, MapPin, User, Truck, Check, X } from 'lucide-react';
import { api } from '../../services/api';

const DeliveryStaffManager = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        phone2: '',
        branchIds: [] as number[],
        maxOrders: 5,
        isAvailable: true
    });

    useEffect(() => {
        loadStaff();
        loadBranches();
    }, []);

    const loadStaff = async () => {
        try {
            const res = await api.distribution.getDeliveryStaff();
            setStaff(res.data || []);
        } catch (err) {
            console.error('Failed to load staff:', err);
        }
    };

    const loadBranches = async () => {
        try {
            const res = await api.branches.getAll();
            setBranches(res.data || res || []);
        } catch (err) {
            console.error('Failed to load branches:', err);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            name: '',
            email: '',
            password: '',
            phone: '',
            phone2: '',
            branchIds: [],
            maxOrders: 5,
            isAvailable: true
        });
        setShowModal(true);
    };

    const openEdit = (s: any) => {
        setEditing(s);
        setForm({
            name: s.name,
            email: s.email || '',
            password: '',
            phone: s.phone,
            phone2: s.phone2 || '',
            branchIds: s.branch_ids?.filter((id: any) => id) || [],
            maxOrders: s.max_orders || 5,
            isAvailable: s.is_available
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.distribution.updateDeliveryStaff(editing.id, form);
            } else {
                await api.distribution.createDeliveryStaff(form);
            }
            setShowModal(false);
            loadStaff();
        } catch (err) {
            console.error('Failed to save:', err);
            alert('فشل حفظ البيانات');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف موظف التوصيل؟')) return;
        try {
            await api.distribution.deleteDeliveryStaff(id);
            loadStaff();
        } catch (err) {
            console.error('Failed to delete:', err);
            alert('فشل الحذف');
        }
    };

    const toggleBranch = (branchId: number) => {
        setForm(prev => ({
            ...prev,
            branchIds: prev.branchIds.includes(branchId)
                ? prev.branchIds.filter(id => id !== branchId)
                : [...prev.branchIds, branchId]
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة موظفي التوصيل</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} />
                    إضافة موظف توصيل
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map(s => (
                    <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Truck size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        s.is_available 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {s.is_available ? 'متاح' : 'غير متاح'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEdit(s)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={14} />
                                <span>{s.phone}</span>
                                {s.phone2 && <span className="text-gray-400">/ {s.phone2}</span>}
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={14} />
                                <span>
                                    {s.branch_names?.filter((n: any) => n).join('، ') || 'لم يتم تعيين فروع'}
                                </span>
                            </div>

                            <div className="pt-3 border-t mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">الطلبات الحالية</span>
                                    <span className="font-bold">
                                        {s.current_orders || 0} / {s.max_orders || 5}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            (s.current_orders || 0) >= (s.max_orders || 5) 
                                                ? 'bg-red-500' 
                                                : 'bg-indigo-600'
                                        }`}
                                        style={{ width: `${Math.min(100, ((s.current_orders || 0) / (s.max_orders || 5)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {staff.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <Truck size={48} className="mx-auto mb-4 opacity-30" />
                        <p>لا يوجد موظفي توصيل</p>
                        <button
                            onClick={openCreate}
                            className="mt-4 text-indigo-600 hover:underline"
                        >
                            إضافة موظف توصيل جديد
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editing ? 'تعديل موظف توصيل' : 'إضافة موظف توصيل جديد'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الاسم *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            {!editing && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">البريد الإلكتروني *</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({...form, email: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">كلمة المرور *</label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({...form, password: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">رقم الهاتف *</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">رقم بديل</label>
                                    <input
                                        type="tel"
                                        value={form.phone2}
                                        onChange={e => setForm({...form, phone2: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">الحد الأقصى للطلبات</label>
                                <input
                                    type="number"
                                    value={form.maxOrders}
                                    onChange={e => setForm({...form, maxOrders: parseInt(e.target.value) || 5})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">الفروع المُعيّن إليها</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                                    {branches.map(branch => (
                                        <label 
                                            key={branch.id} 
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.branchIds.includes(branch.id)}
                                                onChange={() => toggleBranch(branch.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                                            />
                                            <span>{branch.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {editing && (
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isAvailable}
                                            onChange={e => setForm({...form, isAvailable: e.target.checked})}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                                        />
                                        <span>متاح للعمل</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    {editing ? 'تحديث' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryStaffManager;
