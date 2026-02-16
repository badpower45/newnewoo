import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle, XCircle, AlertCircle, Loader, Save, Upload, 
    Trash2, Edit2, Eye, EyeOff, Image as ImageIcon, Package
} from 'lucide-react';
import { API_URL } from '../../src/config';

interface DraftProduct {
    id: number;
    name: string | null;
    category: string | null;
    subcategory: string | null;
    barcode: string | null;
    old_price: number | null;
    price: number | null;
    discount_percentage: number;
    image: string | null;
    branch_id: number;
    stock_quantity: number;
    expiry_date: string | null;
    brand_name: string | null;
    status: string;
    validation_errors: {
        errors: string[];
        warnings: string[];
    } | null;
    notes: string | null;
    created_at: string;
}

const DraftProductsReview: React.FC = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState<DraftProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<DraftProduct>>({});

    useEffect(() => {
        loadDrafts();
    }, [batchId]);

    const loadDrafts = async () => {
        setLoading(true);
        try {
            const url = batchId 
                ? `${API_URL}/products/drafts?batchId=${batchId}`
                : `${API_URL}/products/drafts`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setDrafts(data.drafts);
            }
        } catch (err) {
            console.error('Error loading drafts:', err);
            alert('فشل تحميل المنتجات المسودة');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (draft: DraftProduct) => {
        setEditingId(draft.id);
        setEditForm({ ...draft });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveDraft = async (id: number) => {
        try {
            const response = await fetch(`${API_URL}/products/drafts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();
            
            if (data.success) {
                setDrafts(drafts.map(d => d.id === id ? data.draft : d));
                setEditingId(null);
                setEditForm({});
                alert('تم حفظ التعديلات');
            }
        } catch (err) {
            console.error('Error saving draft:', err);
            alert('فشل حفظ التعديلات');
        }
    };

    const deleteDraft = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            const response = await fetch(`${API_URL}/products/drafts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setDrafts(drafts.filter(d => d.id !== id));
                alert('تم حذف المنتج');
            }
        } catch (err) {
            console.error('Error deleting draft:', err);
            alert('فشل حذف المنتج');
        }
    };

    const publishSelected = async () => {
        if (selectedDrafts.length === 0) {
            alert('يرجى اختيار منتجات للنشر');
            return;
        }

        if (!confirm(`هل أنت متأكد من نشر ${selectedDrafts.length} منتج؟`)) return;

        setPublishing(true);
        try {
            const response = await fetch(`${API_URL}/products/drafts/batch/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ draftIds: selectedDrafts })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                await loadDrafts();
                setSelectedDrafts([]);
            }
        } catch (err) {
            console.error('Error publishing:', err);
            alert('فشل نشر المنتجات');
        } finally {
            setPublishing(false);
        }
    };

    const publishSingle = async (id: number) => {
        if (!confirm('هل أنت متأكد من نشر هذا المنتج؟')) return;

        try {
            const response = await fetch(`${API_URL}/products/drafts/${id}/publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                alert('تم نشر المنتج بنجاح');
                await loadDrafts();
            }
        } catch (err: any) {
            console.error('Error publishing:', err);
            alert(err.response?.data?.error || 'فشل نشر المنتج');
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedDrafts(prev => 
            prev.includes(id) 
                ? prev.filter(d => d !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedDrafts.length === drafts.length) {
            setSelectedDrafts([]);
        } else {
            setSelectedDrafts(drafts.map(d => d.id));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    مراجعة المنتجات المستوردة
                </h1>
                <p className="text-gray-600">
                    راجع وعدّل المنتجات قبل نشرها في المتجر ({drafts.length} منتج)
                </p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={selectAll}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            {selectedDrafts.length === drafts.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                        </button>
                        <span className="text-gray-600">
                            {selectedDrafts.length} محدد
                        </span>
                    </div>
                    
                    <button
                        onClick={publishSelected}
                        disabled={selectedDrafts.length === 0 || publishing}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {publishing ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                جاري النشر...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                نشر المحدد ({selectedDrafts.length})
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {drafts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        لا توجد منتجات مسودة
                    </h3>
                    <p className="text-gray-600 mb-6">
                        قم باستيراد منتجات من Excel للبدء
                    </p>
                    <button
                        onClick={() => navigate('/admin/import')}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        استيراد منتجات
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {drafts.map((draft) => (
                        <div 
                            key={draft.id} 
                            className="bg-white rounded-xl shadow-md p-6 border-2 hover:border-primary transition-colors"
                        >
                            {editingId === draft.id ? (
                                /* Edit Mode */
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                اسم المنتج *
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.name || ''}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                الباركود
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.barcode || ''}
                                                onChange={(e) => setEditForm({...editForm, barcode: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                التصنيف الأساسي
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.category || ''}
                                                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                التصنيف الثانوي
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.subcategory || ''}
                                                onChange={(e) => setEditForm({...editForm, subcategory: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                البراند
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.brand_name || ''}
                                                onChange={(e) => setEditForm({...editForm, brand_name: e.target.value})}
                                                placeholder="اسم البراند"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                السعر *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.price || ''}
                                                onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                السعر القديم
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.old_price || ''}
                                                onChange={(e) => setEditForm({...editForm, old_price: parseFloat(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                الكمية
                                            </label>
                                            <input
                                                type="number"
                                                value={editForm.stock_quantity || 0}
                                                onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                تاريخ الصلاحية
                                            </label>
                                            <input
                                                type="date"
                                                value={editForm.expiry_date || ''}
                                                onChange={(e) => setEditForm({...editForm, expiry_date: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                رابط الصورة
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.image || ''}
                                                onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveDraft(draft.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            حفظ
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div className="flex gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedDrafts.includes(draft.id)}
                                        onChange={() => toggleSelect(draft.id)}
                                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mt-1"
                                    />

                                    {draft.image ? (
                                        <img 
                                            src={draft.image} 
                                            alt={draft.name || 'Product'} 
                                            className="w-20 h-20 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {draft.name || <span className="text-red-500">بدون اسم</span>}
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">التصنيف:</span>
                                                <span className="font-medium text-gray-900 mr-1">
                                                    {draft.category || <span className="text-gray-400">-</span>}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">البراند:</span>
                                                <span className="font-medium text-blue-600 mr-1">
                                                    {draft.brand_name || <span className="text-gray-400">-</span>}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">السعر:</span>
                                                <span className="font-medium text-gray-900 mr-1">
                                                    {draft.price ? `${draft.price} جنيه` : <span className="text-red-500">-</span>}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">الكمية:</span>
                                                <span className="font-medium text-gray-900 mr-1">
                                                    {draft.stock_quantity}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">الباركود:</span>
                                                <span className="font-medium text-gray-900 mr-1">
                                                    {draft.barcode || <span className="text-gray-400">-</span>}
                                                </span>
                                            </div>
                                        </div>

                                        {draft.validation_errors && (draft.validation_errors.errors.length > 0 || draft.validation_errors.warnings.length > 0) && (
                                            <div className="mt-2">
                                                {draft.validation_errors.errors.length > 0 && (
                                                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            {draft.validation_errors.errors.map((err, i) => (
                                                                <div key={i}>{err}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {draft.validation_errors.warnings.length > 0 && (
                                                    <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded mt-1">
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            {draft.validation_errors.warnings.map((warn, i) => (
                                                                <div key={i}>{warn}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => publishSingle(draft.id)}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Upload className="w-4 h-4" />
                                            نشر
                                        </button>
                                        <button
                                            onClick={() => startEdit(draft)}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => deleteDraft(draft.id)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DraftProductsReview;
