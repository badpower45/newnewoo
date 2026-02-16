import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle, XCircle, AlertCircle, Loader, Save, Upload, 
    Trash2, Edit2, Eye, EyeOff, Image as ImageIcon, Package,
    Search, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft
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

const ITEMS_PER_PAGE = 50;

// ─── Lazy Image ───────────────────────────────────────────────
const LazyImage: React.FC<{ src: string; alt: string }> = React.memo(({ src, alt }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
            />
        </div>
    );
});

// ─── Draft Row (table row - much lighter than cards) ──────────
const DraftRow: React.FC<{
    draft: DraftProduct;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    onPublish: (id: number) => void;
    onEdit: (draft: DraftProduct) => void;
    onDelete: (id: number) => void;
    index: number;
}> = React.memo(({ draft, isSelected, onToggleSelect, onPublish, onEdit, onDelete, index }) => {
    const hasErrors = draft.validation_errors?.errors && draft.validation_errors.errors.length > 0;
    const hasWarnings = draft.validation_errors?.warnings && draft.validation_errors.warnings.length > 0;

    return (
        <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
            <td className="px-3 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(draft.id)}
                    className="w-4 h-4 text-primary rounded focus:ring-1 focus:ring-primary"
                />
            </td>
            <td className="px-3 py-3 text-xs text-gray-400">{index}</td>
            <td className="px-3 py-3">
                {draft.image ? (
                    <LazyImage src={draft.image} alt={draft.name || ''} />
                ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                )}
            </td>
            <td className="px-3 py-3">
                <div className="font-medium text-gray-900 text-sm max-w-[200px] truncate">
                    {draft.name || <span className="text-red-500">بدون اسم</span>}
                </div>
                {(hasErrors || hasWarnings) && (
                    <div className="flex gap-1 mt-1">
                        {hasErrors && <XCircle className="w-3.5 h-3.5 text-red-500" title={draft.validation_errors!.errors.join('\n')} />}
                        {hasWarnings && <AlertCircle className="w-3.5 h-3.5 text-yellow-500" title={draft.validation_errors!.warnings.join('\n')} />}
                    </div>
                )}
            </td>
            <td className="px-3 py-3 text-sm text-gray-600">{draft.barcode || '-'}</td>
            <td className="px-3 py-3 text-sm text-gray-600">{draft.category || '-'}</td>
            <td className="px-3 py-3 text-sm text-blue-600 font-medium">{draft.brand_name || '-'}</td>
            <td className="px-3 py-3 text-sm text-gray-500">{draft.old_price ? `${draft.old_price}` : '-'}</td>
            <td className="px-3 py-3 text-sm font-bold text-green-700">{draft.price ? `${draft.price}` : '-'}</td>
            <td className="px-3 py-3 text-sm text-gray-600">{draft.stock_quantity}</td>
            <td className="px-3 py-3">
                <div className="flex gap-1">
                    <button onClick={() => onPublish(draft.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="نشر">
                        <Upload className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(draft)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(draft.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

// ─── Main Component ───────────────────────────────────────────
const DraftProductsReview: React.FC = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState<DraftProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [publishProgress, setPublishProgress] = useState('');
    const [selectedDrafts, setSelectedDrafts] = useState<Set<number>>(new Set());
    const [editingDraft, setEditingDraft] = useState<DraftProduct | null>(null);
    const [editForm, setEditForm] = useState<Partial<DraftProduct>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadDrafts();
    }, [batchId]);

    // ─── Filtered + Paginated ──────────────────────────────────
    const filteredDrafts = useMemo(() => {
        if (!searchQuery.trim()) return drafts;
        const q = searchQuery.trim().toLowerCase();
        return drafts.filter(d =>
            (d.name && d.name.toLowerCase().includes(q)) ||
            (d.barcode && d.barcode.includes(q)) ||
            (d.category && d.category.toLowerCase().includes(q)) ||
            (d.brand_name && d.brand_name.toLowerCase().includes(q))
        );
    }, [drafts, searchQuery]);

    const totalPages = Math.ceil(filteredDrafts.length / ITEMS_PER_PAGE);
    
    const paginatedDrafts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDrafts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredDrafts, currentPage]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // ─── Data Loading ──────────────────────────────────────────
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

    // ─── Edit ──────────────────────────────────────────────────
    const startEdit = useCallback((draft: DraftProduct) => {
        setEditingDraft(draft);
        setEditForm({ ...draft });
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingDraft(null);
        setEditForm({});
    }, []);

    const saveDraft = async () => {
        if (!editingDraft) return;
        try {
            const response = await fetch(`${API_URL}/products/drafts/${editingDraft.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();
            
            if (data.success) {
                setDrafts(prev => prev.map(d => d.id === editingDraft.id ? data.draft : d));
                setEditingDraft(null);
                setEditForm({});
                alert('تم حفظ التعديلات');
            }
        } catch (err) {
            console.error('Error saving draft:', err);
            alert('فشل حفظ التعديلات');
        }
    };

    // ─── Delete ────────────────────────────────────────────────
    const deleteDraft = useCallback(async (id: number) => {
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
                setDrafts(prev => prev.filter(d => d.id !== id));
                setSelectedDrafts(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        } catch (err) {
            console.error('Error deleting draft:', err);
            alert('فشل حذف المنتج');
        }
    }, []);

    // ─── Publish ───────────────────────────────────────────────
    const publishAll = async () => {
        if (!batchId) {
            alert('لا يوجد batch ID');
            return;
        }
        if (!confirm(`هل أنت متأكد من نشر جميع ${drafts.length} منتج؟`)) return;

        setPublishing(true);
        setPublishProgress('جاري النشر...');
        try {
            const response = await fetch(`${API_URL}/products/drafts/${batchId}/publish-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setPublishProgress(`✅ تم نشر ${data.published || data.results?.success || 0} منتج بنجاح`);
                setTimeout(() => {
                    alert(data.message || 'تم النشر بنجاح');
                    loadDrafts();
                    setSelectedDrafts(new Set());
                }, 500);
            } else {
                setPublishProgress('❌ فشل النشر');
                alert(data.error || 'فشل النشر');
            }
        } catch (err) {
            console.error('Error publishing:', err);
            setPublishProgress('❌ فشل النشر');
            alert('فشل نشر المنتجات');
        } finally {
            setPublishing(false);
        }
    };

    const publishSelected = async () => {
        if (selectedDrafts.size === 0) {
            alert('يرجى اختيار منتجات للنشر');
            return;
        }

        if (!confirm(`هل أنت متأكد من نشر ${selectedDrafts.size} منتج؟`)) return;

        setPublishing(true);
        try {
            const response = await fetch(`${API_URL}/products/drafts/batch/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ draftIds: Array.from(selectedDrafts) })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                await loadDrafts();
                setSelectedDrafts(new Set());
            }
        } catch (err) {
            console.error('Error publishing:', err);
            alert('فشل نشر المنتجات');
        } finally {
            setPublishing(false);
        }
    };

    const publishSingle = useCallback(async (id: number) => {
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
                setDrafts(prev => prev.filter(d => d.id !== id));
            }
        } catch (err: any) {
            console.error('Error publishing:', err);
            alert('فشل نشر المنتج');
        }
    }, []);

    // ─── Selection ─────────────────────────────────────────────
    const toggleSelect = useCallback((id: number) => {
        setSelectedDrafts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectAllVisible = useCallback(() => {
        setSelectedDrafts(prev => {
            const visibleIds = paginatedDrafts.map(d => d.id);
            const allSelected = visibleIds.every(id => prev.has(id));
            const next = new Set(prev);
            if (allSelected) {
                visibleIds.forEach(id => next.delete(id));
            } else {
                visibleIds.forEach(id => next.add(id));
            }
            return next;
        });
    }, [paginatedDrafts]);

    const selectAllDrafts = useCallback(() => {
        if (selectedDrafts.size === drafts.length) {
            setSelectedDrafts(new Set());
        } else {
            setSelectedDrafts(new Set(drafts.map(d => d.id)));
        }
    }, [drafts, selectedDrafts.size]);

    // ─── Stats ─────────────────────────────────────────────────
    const stats = useMemo(() => {
        let withErrors = 0, withWarnings = 0, withBrand = 0, withPrice = 0;
        for (const d of drafts) {
            if (d.validation_errors?.errors?.length) withErrors++;
            if (d.validation_errors?.warnings?.length) withWarnings++;
            if (d.brand_name) withBrand++;
            if (d.price) withPrice++;
        }
        return { withErrors, withWarnings, withBrand, withPrice, total: drafts.length };
    }, [drafts]);

    // ─── Render ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-full mx-auto">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    مراجعة المنتجات المستوردة
                </h1>
                <p className="text-gray-600 text-sm">
                    راجع وعدّل المنتجات قبل نشرها في المتجر
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-500">إجمالي المنتجات</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.withPrice}</div>
                    <div className="text-xs text-gray-500">بسعر</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.withBrand}</div>
                    <div className="text-xs text-gray-500">ببراند</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
                    <div className="text-2xl font-bold text-red-500">{stats.withErrors}</div>
                    <div className="text-xs text-gray-500">أخطاء</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-500">{stats.withWarnings}</div>
                    <div className="text-xs text-gray-500">تحذيرات</div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-sm border p-3 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث بالاسم أو الباركود أو البراند..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-3 pr-9 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                        </div>

                        <button
                            onClick={selectAllDrafts}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            {selectedDrafts.size === drafts.length ? 'إلغاء الكل' : `تحديد الكل (${drafts.length})`}
                        </button>

                        <span className="text-sm text-gray-500">
                            {selectedDrafts.size > 0 && `${selectedDrafts.size} محدد`}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {selectedDrafts.size > 0 && (
                            <button
                                onClick={publishSelected}
                                disabled={publishing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                نشر المحدد ({selectedDrafts.size})
                            </button>
                        )}
                        <button
                            onClick={publishAll}
                            disabled={publishing || drafts.length === 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {publishing ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    {publishProgress || 'جاري النشر...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    نشر الكل ({drafts.length})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingDraft && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={cancelEdit}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">تعديل المنتج</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
                                    <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                                    <input type="text" value={editForm.barcode || ''} onChange={(e) => setEditForm({...editForm, barcode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف الأساسي</label>
                                    <input type="text" value={editForm.category || ''} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف الثانوي</label>
                                    <input type="text" value={editForm.subcategory || ''} onChange={(e) => setEditForm({...editForm, subcategory: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">البراند</label>
                                    <input type="text" value={editForm.brand_name || ''} onChange={(e) => setEditForm({...editForm, brand_name: e.target.value})} placeholder="اسم البراند" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر *</label>
                                    <input type="number" step="0.01" value={editForm.price || ''} onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر القديم</label>
                                    <input type="number" step="0.01" value={editForm.old_price || ''} onChange={(e) => setEditForm({...editForm, old_price: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                                    <input type="number" value={editForm.stock_quantity || 0} onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الصلاحية</label>
                                    <input type="date" value={editForm.expiry_date || ''} onChange={(e) => setEditForm({...editForm, expiry_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة</label>
                                    <input type="text" value={editForm.image || ''} onChange={(e) => setEditForm({...editForm, image: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6 justify-end">
                                <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">إلغاء</button>
                                <button onClick={saveDraft} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    حفظ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            {drafts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد منتجات مسودة</h3>
                    <p className="text-gray-600 mb-6">قم باستيراد منتجات من Excel للبدء</p>
                    <button onClick={() => navigate('/admin/import')} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        استيراد منتجات
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right min-w-[900px]">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={paginatedDrafts.length > 0 && paginatedDrafts.every(d => selectedDrafts.has(d.id))}
                                                onChange={selectAllVisible}
                                                className="w-4 h-4 text-primary rounded"
                                            />
                                        </th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500 w-10">#</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500 w-20">الصورة</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">المنتج</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">الباركود</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">التصنيف</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">البراند</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">السعر قبل</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">السعر بعد</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500">الكمية</th>
                                        <th className="px-3 py-3 text-xs font-semibold text-gray-500 w-28">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDrafts.map((draft, i) => (
                                        <DraftRow
                                            key={draft.id}
                                            draft={draft}
                                            isSelected={selectedDrafts.has(draft.id)}
                                            onToggleSelect={toggleSelect}
                                            onPublish={publishSingle}
                                            onEdit={startEdit}
                                            onDelete={deleteDraft}
                                            index={(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 bg-white rounded-xl shadow-sm border p-3">
                            <div className="text-sm text-gray-500">
                                عرض {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDrafts.length)} من {filteredDrafts.length}
                                {searchQuery && ` (${drafts.length} إجمالي)`}
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                                            {page}
                                        </button>
                                    );
                                })}
                                
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DraftProductsReview;
