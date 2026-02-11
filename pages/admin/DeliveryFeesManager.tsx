import React, { useEffect, useMemo, useState } from 'react';
import { Save, RefreshCw, MapPin, ShieldCheck, Check } from 'lucide-react';
import { API_URL } from '../../src/config';

interface GovernorateFee {
    id: number;
    governorate: string;
    delivery_fee: number;
    min_order: number;
    free_delivery_threshold: number;
    is_active: boolean;
    updated_at?: string;
}

const REGION_GROUPS: Record<string, string[]> = {
    'القاهرة الكبرى': ['القاهرة', 'الجيزة', 'القليوبية'],
    'مدن القناة': ['بورسعيد', 'السويس', 'الإسماعيلية'],
    'الدلتا': ['الدقهلية', 'الشرقية', 'الغربية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'المنوفية'],
    'الصعيد': ['بني سويف', 'الفيوم', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان'],
    'أخرى': ['الإسكندرية', 'مطروح', 'البحر الأحمر', 'الوادي الجديد', 'شمال سيناء', 'جنوب سيناء']
};

const DeliveryFeesManager: React.FC = () => {
    const [fees, setFees] = useState<GovernorateFee[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [savedId, setSavedId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const fetchFees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/delivery-fees/governorates/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        return fees.filter((f) => !term || (f.governorate && f.governorate.toLowerCase().includes(term)));
    }, [fees, search]);

    const updateFee = async (fee: GovernorateFee) => {
        setSavingId(fee.id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/delivery-fees/governorates/${fee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    delivery_fee: fee.delivery_fee,
                    min_order: fee.min_order,
                    free_delivery_threshold: fee.free_delivery_threshold,
                    is_active: fee.is_active
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update');
            }
            const json = await res.json();
            const updated = json.data;
            setFees((prev) => prev.map((f) => (f.id === fee.id ? { ...f, ...updated } : f)));
            setSavedId(fee.id);
            setTimeout(() => setSavedId(null), 2000);
        } catch (err) {
            console.error('Failed to update fee', err);
            alert((err as Error).message || 'فشل تحديث رسوم التوصيل');
        } finally {
            setSavingId(null);
        }
    };

    const grouped = useMemo(() => {
        const result: Record<string, GovernorateFee[]> = {};
        for (const [region, govNames] of Object.entries(REGION_GROUPS)) {
            const list = filteredFees.filter((f) =>
                govNames.some((name) => f.governorate && f.governorate.includes(name))
            );
            result[region] = list;
        }
        const allGroupedGovs = Object.values(REGION_GROUPS).flat();
        const uncategorized = filteredFees.filter(
            (f) => f.governorate && !allGroupedGovs.some((name) => f.governorate.includes(name))
        );
        if (uncategorized.length > 0) {
            result['محافظات أخرى'] = uncategorized;
        }
        return result;
    }, [filteredFees]);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <MapPin className="text-orange-600" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">إدارة رسوم التوصيل</h1>
                            <p className="text-sm text-gray-500">تعديل الأسعار والحد الأدنى لكل محافظة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث عن محافظة"
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:flex-initial"
                        />
                        <button
                            onClick={fetchFees}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> تحديث
                        </button>
                    </div>
                </div>

                {/* Summary */}
                {fees.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                            <p className="text-2xl font-bold text-orange-600">{fees.length}</p>
                            <p className="text-xs text-gray-500 mt-1">إجمالي المحافظات</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {fees.filter(f => f.is_active).length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">نشطة</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {fees.length > 0 ? Math.round(fees.reduce((s, f) => s + Number(f.delivery_fee || 0), 0) / fees.length) : 0} جنيه
                            </p>
                            <p className="text-xs text-gray-500 mt-1">متوسط رسوم التوصيل</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border shadow-sm text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {fees.length > 0 ? Math.round(fees.reduce((s, f) => s + Number(f.free_delivery_threshold || 0), 0) / fees.length) : 0} جنيه
                            </p>
                            <p className="text-xs text-gray-500 mt-1">متوسط حد التوصيل المجاني</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
                        <RefreshCw size={32} className="animate-spin text-orange-500 mx-auto mb-3" />
                        <p className="text-gray-500">جاري التحميل...</p>
                    </div>
                ) : fees.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
                        <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد بيانات رسوم توصيل</h3>
                        <p className="text-gray-500 text-sm mb-4">اضغط "تحديث" لإنشاء سجلات المحافظات تلقائياً</p>
                        <button
                            onClick={fetchFees}
                            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            إنشاء المحافظات
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([title, list]: [string, GovernorateFee[]]) => (
                            <div key={title} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="text-orange-600" size={18} />
                                        <h2 className="font-bold text-gray-800">{title}</h2>
                                    </div>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{list.length} محافظة</span>
                                </div>
                                {list.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-400">لا توجد محافظات في هذا القسم</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-right">
                                            <thead className="bg-gray-50 text-sm text-gray-600">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">المحافظة</th>
                                                    <th className="px-4 py-3 font-medium">ظاهرة</th>
                                                    <th className="px-4 py-3 font-medium">رسوم التوصيل</th>
                                                    <th className="px-4 py-3 font-medium">الحد الأدنى</th>
                                                    <th className="px-4 py-3 font-medium">التوصيل المجاني من</th>
                                                    <th className="px-4 py-3 font-medium w-28">حفظ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {list.map((fee) => (
                                                    <tr key={fee.id} className={`hover:bg-orange-50/30 transition-colors ${!fee.is_active ? 'opacity-50' : ''}`}>
                                                        <td className="px-4 py-3 font-semibold text-gray-800">{fee.governorate}</td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setFees((prev) =>
                                                                        prev.map((f) =>
                                                                            f.id === fee.id ? { ...f, is_active: !f.is_active } : f
                                                                        )
                                                                    )
                                                                }
                                                                className={`w-12 h-7 rounded-full transition-colors relative ${
                                                                    fee.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                                }`}
                                                            >
                                                                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                                                    fee.is_active ? 'right-0.5' : 'left-0.5'
                                                                }`} />
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={fee.delivery_fee ?? 0}
                                                                    onChange={(e) =>
                                                                        setFees((prev) =>
                                                                            prev.map((f) =>
                                                                                f.id === fee.id ? { ...f, delivery_fee: Number(e.target.value) } : f
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-24 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                                />
                                                                <span className="text-xs text-gray-400">جنيه</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={fee.min_order ?? 0}
                                                                    onChange={(e) =>
                                                                        setFees((prev) =>
                                                                            prev.map((f) =>
                                                                                f.id === fee.id ? { ...f, min_order: Number(e.target.value) } : f
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-24 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                                />
                                                                <span className="text-xs text-gray-400">جنيه</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={fee.free_delivery_threshold ?? 0}
                                                                    onChange={(e) =>
                                                                        setFees((prev) =>
                                                                            prev.map((f) =>
                                                                                f.id === fee.id
                                                                                    ? { ...f, free_delivery_threshold: Number(e.target.value) }
                                                                                    : f
                                                                            )
                                                                        )
                                                                    }
                                                                    className="w-28 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                                />
                                                                <span className="text-xs text-gray-400">جنيه</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => updateFee(fee)}
                                                                disabled={savingId === fee.id}
                                                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                    savedId === fee.id
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50'
                                                                }`}
                                                            >
                                                                {savingId === fee.id ? (
                                                                    <RefreshCw className="animate-spin" size={16} />
                                                                ) : savedId === fee.id ? (
                                                                    <Check size={16} />
                                                                ) : (
                                                                    <Save size={16} />
                                                                )}
                                                                {savedId === fee.id ? 'تم' : 'حفظ'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryFeesManager;
