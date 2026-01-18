import React, { useEffect, useMemo, useState } from 'react';
import { Save, RefreshCw, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface GovernorateFee {
    id: number;
    governorate: string;
    delivery_fee: number;
    min_order: number;
    free_delivery_threshold: number;
    is_active: boolean;
    updated_at?: string;
}

const DeliveryFeesManager: React.FC = () => {
    const { user } = useAuth();
    const [fees, setFees] = useState<GovernorateFee[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const fetchFees = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${api.API_URL}/delivery-fees/governorates/all`);
            const json = await res.json();
            const data = json.data || json || [];
            if (Array.isArray(data)) setFees(data as GovernorateFee[]);
        } catch (err) {
            console.error('Failed to load delivery fees', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const filteredFees = useMemo(() => {
        const term = search.trim().toLowerCase();
        return fees.filter((f) => !term || f.governorate.toLowerCase().includes(term));
    }, [fees, search]);

    const updateFee = async (fee: GovernorateFee) => {
        setSavingId(fee.id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${api.API_URL}/delivery-fees/governorates/${fee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    delivery_fee: fee.delivery_fee,
                    min_order: fee.min_order,
                    free_delivery_threshold: fee.free_delivery_threshold
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update');
            }
            const json = await res.json();
            const updated = json.data;
            setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, ...updated } : f)));
        } catch (err) {
            console.error('Failed to update fee', err);
            alert((err as Error).message || 'فشل تحديث رسوم التوصيل');
        } finally {
            setSavingId(null);
        }
    };

    const grouped = useMemo(() => {
        return {
            'القاهرة الكبرى': filteredFees.filter((f) => ['القاهرة', 'الجيزة', 'القليوبية'].includes(f.governorate)),
            'مدن القناة': filteredFees.filter((f) => ['بورسعيد', 'بور فؤاد', 'السويس', 'الإسماعيلية'].includes(f.governorate)),
            'دلتا': filteredFees.filter((f) => ['الدقهلية', 'المنصورة', 'الشرقية', 'الغربية', 'البحيرة', 'كفر الشيخ', 'دمياط'].includes(f.governorate))
        };
    }, [filteredFees]);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-orange-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">إدارة رسوم التوصيل</h1>
                            <p className="text-sm text-gray-500">تعديل الأسعار والحد الأدنى لكل محافظة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث عن محافظة"
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                            onClick={fetchFees}
                            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-lg hover:bg-gray-50"
                        >
                            <RefreshCw size={16} /> تحديث
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-6 shadow-sm border text-center text-gray-500">
                        جاري التحميل...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([title, list]) => (
                            <div key={title} className="bg-white rounded-xl shadow-sm border">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="text-orange-600" size={18} />
                                        <h2 className="font-bold text-gray-800">{title}</h2>
                                    </div>
                                    <span className="text-sm text-gray-500">{list.length} محافظة</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-right">
                                        <thead className="bg-gray-50 text-sm text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3">المحافظة</th>
                                                <th className="px-4 py-3">رسوم التوصيل</th>
                                                <th className="px-4 py-3">الحد الأدنى</th>
                                                <th className="px-4 py-3">التوصيل المجاني من</th>
                                                <th className="px-4 py-3">حفظ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {list.map((fee) => (
                                                <tr key={fee.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-semibold text-gray-800">{fee.governorate}</td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={fee.delivery_fee}
                                                            onChange={(e) => setFees((prev) => prev.map((f) => f.id === fee.id ? { ...f, delivery_fee: Number(e.target.value) } : f))}
                                                            className="w-24 border rounded-lg px-2 py-1 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={fee.min_order}
                                                            onChange={(e) => setFees((prev) => prev.map((f) => f.id === fee.id ? { ...f, min_order: Number(e.target.value) } : f))}
                                                            className="w-24 border rounded-lg px-2 py-1 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={fee.free_delivery_threshold}
                                                            onChange={(e) => setFees((prev) => prev.map((f) => f.id === fee.id ? { ...f, free_delivery_threshold: Number(e.target.value) } : f))}
                                                            className="w-28 border rounded-lg px-2 py-1 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => updateFee(fee)}
                                                            disabled={savingId === fee.id}
                                                            className="flex items-center gap-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
                                                        >
                                                            {savingId === fee.id ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                                            حفظ
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {list.length === 0 && (
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-500" colSpan={5}>لا توجد محافظات في هذا القسم.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryFeesManager;
