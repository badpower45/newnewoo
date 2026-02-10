import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { API_URL } from '../../src/config';

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    total: number;
    batchId?: string;
    published?: number;
    autoPublished?: boolean;
    details: {
        imported: any[];
        validationErrors: any[];
        importErrors: any[];
    };
}

interface DraftProduct {
    id: number;
    name: string;
    barcode: string;
    brand_name: string;
    old_price: number;
    price: number;
    category: string;
    subcategory: string;
    branch_id: number;
    stock_quantity: number;
    image: string;
    expiry_date: string;
}

const ProductImporter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [settingUp, setSettingUp] = useState(false);
    const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
    const [loadingDrafts, setLoadingDrafts] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [autoPublish, setAutoPublish] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedProduct, setEditedProduct] = useState<Partial<DraftProduct>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const navigate = useNavigate();

    const setupDraftTable = async () => {
        setSettingUp(true);
        try {
            const response = await fetch(`${API_URL}/products/setup-draft-table`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ تم إعداد قاعدة البيانات بنجاح! يمكنك الآن رفع المنتجات.');
            } else {
                alert(`❌ فشل الإعداد: ${data.message}`);
            }
        } catch (err) {
            console.error('Setup error:', err);
            alert('❌ حدث خطأ أثناء الإعداد');
        } finally {
            setSettingUp(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            // Only set false if we're leaving the dropzone itself, not its children
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
                setDragActive(false);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        // Some browsers/OSes may provide an empty or generic MIME type (e.g. application/octet-stream)
        // so we fall back to checking the file extension.
        const lowerName = (file.name || '').toLowerCase();
        const hasValidExtension =
            lowerName.endsWith('.xlsx') ||
            lowerName.endsWith('.xls') ||
            lowerName.endsWith('.csv');

        const hasValidMime = validTypes.includes(file.type);

        if (!hasValidMime && !hasValidExtension) {
            alert('نوع الملف غير صحيح. يرجى رفع ملف Excel (.xlsx أو .xls) أو CSV');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
            return;
        }

        setFile(file);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setResult(null);
        setDraftProducts([]);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('autoPublish', autoPublish.toString());

            const response = await fetch(`${API_URL}/products/bulk-import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                setFile(null);
                
                // Load draft products only if not auto-published
                if (data.batchId && !data.autoPublished) {
                    await loadDraftProducts(data.batchId);
                } else if (data.autoPublished) {
                    // Show success message for auto-published products
                    setTimeout(() => {
                        if (confirm('تم نشر المنتجات بنجاح! هل تريد الانتقال إلى قائمة المنتجات؟')) {
                            navigate('/admin/products');
                        }
                    }, 1000);
                }
            } else {
                const errorMessage = data.error || data.message || 'حدث خطأ غير معروف';
                const detailsMessage = data.details ? `\n\nالتفاصيل: ${data.details}` : '';
                alert(`فشل الرفع: ${errorMessage}${detailsMessage}`);
                console.error('Upload failed:', data);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('حدث خطأ أثناء رفع الملف');
        } finally {
            setUploading(false);
        }
    };

    const loadDraftProducts = async (batchId: string) => {
        setLoadingDrafts(true);
        try {
            const response = await fetch(`${API_URL}/products/drafts/${batchId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setDraftProducts(data.data);
            }
        } catch (err) {
            console.error('Error loading drafts:', err);
        } finally {
            setLoadingDrafts(false);
        }
    };

    const startEdit = (product: DraftProduct) => {
        setEditingId(product.id);
        setEditedProduct({ ...product });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedProduct({});
    };

    const saveProductChanges = async (productId: number) => {
        if (!result?.batchId) return;

        setSavingId(productId);
        try {
            const response = await fetch(`${API_URL}/products/drafts/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editedProduct.name,
                    barcode: editedProduct.barcode,
                    price: editedProduct.price,
                    old_price: editedProduct.old_price,
                    category: editedProduct.category,
                    subcategory: editedProduct.subcategory,
                    stock_quantity: editedProduct.stock_quantity,
                    image: editedProduct.image
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update local state
                setDraftProducts(prev => prev.map(p => 
                    p.id === productId ? { ...p, ...editedProduct } : p
                ));
                setEditingId(null);
                setEditedProduct({});
                alert('✅ تم حفظ التعديلات بنجاح');
            } else {
                alert(`❌ فشل حفظ التعديلات: ${data.message || 'حدث خطأ'}`);
            }
        } catch (err) {
            console.error('Error saving changes:', err);
            alert('حدث خطأ أثناء حفظ التعديلات');
        } finally {
            setSavingId(null);
        }
    };

    const publishAllProducts = async () => {
        if (!result?.batchId) return;

        if (!confirm(`هل أنت متأكد من نشر ${draftProducts.length} منتج إلى القائمة الرئيسية؟`)) {
            return;
        }

        setPublishing(true);
        try {
            let totalPublished = 0;
            let remaining = draftProducts.length;
            let attempts = 0;
            const batchLimit = 700; // Publish all at once

            while (remaining > 0 && attempts < 20) {
                const response = await fetch(
                    `${API_URL}/products/drafts/${result.batchId}/publish-all?limit=${batchLimit}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    alert(`❌ فشل النشر: ${data.message || 'حدث خطأ'}`);
                    return;
                }

                totalPublished += data.publishedCount || 0;
                remaining = typeof data.remaining === 'number' ? data.remaining : 0;
                attempts += 1;

                if (remaining > 0 && (data.publishedCount || 0) === 0) {
                    break;
                }
            }

            if (remaining > 0) {
                await loadDraftProducts(result.batchId);
                alert(`✅ تم نشر ${totalPublished} منتج. تبقّى ${remaining} منتج يحتاج مراجعة (غالبًا سعر ناقص أو بيانات غير مكتملة).`);
                return;
            }

            alert(`✅ تم نشر ${totalPublished} منتج بنجاح!`);
            setResult(null);
            setDraftProducts([]);
            setFile(null);
            if (confirm('هل تريد الانتقال إلى صفحة المنتجات؟')) {
                navigate('/admin/products');
            }
        } catch (err) {
            console.error('Publishing error:', err);
            alert('حدث خطأ أثناء نشر المنتجات');
        } finally {
            setPublishing(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await fetch(`${API_URL}/products/bulk-import/template`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Template download error:', err);
            alert('فشل تحميل القالب');
        }
    };

    const exportProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products/bulk-import/export`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to export products');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const today = new Date().toISOString().split('T')[0];
            a.download = `products_export_${today}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export error:', err);
            alert('فشل تصدير المنتجات');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">استيراد المنتجات من Excel</h1>
                        <p className="text-gray-600">قم برفع ملف Excel يحتوي على بيانات المنتجات لإضافتها دفعة واحدة</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportProducts}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            تصدير المنتجات
                        </button>
                        <button
                            onClick={() => navigate('/admin/drafts')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            عرض المسودات
                        </button>
                        <button
                            onClick={setupDraftTable}
                            disabled={settingUp}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {settingUp ? 'جاري الإعداد...' : '⚙️ إعداد قاعدة البيانات'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">تحميل قالب Excel</h3>
                        <p className="text-gray-600 mb-4">
                            احصل على ملف Excel جاهز مع الأعمدة المطلوبة ومثال على البيانات الصحيحة
                        </p>
                        <button
                            onClick={downloadTemplate}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            تحميل القالب
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">رفع ملف Excel</h3>
                
                <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                        dragActive 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-300 hover:border-orange-400 bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                            <Upload className="w-10 h-10 text-orange-600" />
                        </div>
                        
                        {file ? (
                            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg border border-gray-200">
                                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-lg font-medium text-gray-700 mb-2">
                                        اسحب وأفلت ملف Excel هنا
                                    </p>
                                    <p className="text-gray-500">أو اضغط لاختيار الملف</p>
                                </div>
                                
                                <label className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer">
                                    اختر ملف
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </>
                        )}
                        
                        <p className="text-sm text-gray-500">
                            الملفات المدعومة: Excel (.xlsx, .xls), CSV | الحد الأقصى: 10 ميجابايت
                        </p>
                    </div>
                </div>

                {file && (
                    <div className="mt-6 space-y-4">
                        {/* Auto Publish Checkbox */}
                        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="autoPublish"
                                checked={autoPublish}
                                onChange={(e) => setAutoPublish(e.target.checked)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="autoPublish" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                نشر المنتجات مباشرة إلى القائمة الرئيسية (بدون مراجعة)
                            </label>
                        </div>
                        
                        <div className="flex justify-center">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        جاري الرفع...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        {autoPublish ? 'رفع ونشر المنتجات' : 'رفع وإضافة للمسودات'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">نتائج الاستيراد</h3>
                    
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                                    <p className="text-sm text-green-600">تم الاستيراد</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-8 h-8 text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                                    <p className="text-sm text-red-600">فشل</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold text-blue-700">{result.total}</p>
                                    <p className="text-sm text-blue-600">إجمالي</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className={`p-4 rounded-lg mb-6 ${result.success ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                        <p className="font-medium">{result.message}</p>
                    </div>

                    {/* Errors Details */}
                    {result.details.validationErrors.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">أخطاء التحقق من البيانات:</h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                {result.details.validationErrors.map((error, index) => (
                                    <div key={index} className="mb-3 pb-3 border-b border-red-200 last:border-0">
                                        <p className="font-medium text-red-900">الصف {error.row}</p>
                                        <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                                            {error.errors.map((err: string, i: number) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Import Errors */}
                    {result.details.importErrors.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">أخطاء الاستيراد:</h4>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                {result.details.importErrors.map((error, index) => (
                                    <div key={index} className="mb-2 text-sm text-orange-800">
                                        <span className="font-medium">{error.name}:</span> {error.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Success List */}
                    {result.details.imported.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">المنتجات المستوردة بنجاح:</h4>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {result.details.imported.map((product, index) => (
                                        <div key={index} className="text-sm text-green-800">
                                            <span className="font-medium">{product.name}</span>
                                            <span className="text-green-600 mr-2">({product.category})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Draft Products Preview */}
            {draftProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            معاينة المنتجات المستوردة ({draftProducts.length})
                        </h3>
                        <button
                            onClick={publishAllProducts}
                            disabled={publishing}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg shadow-lg"
                        >
                            {publishing ? (
                                <>
                                    <Loader className="w-6 h-6 animate-spin" />
                                    جاري النشر...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-6 h-6" />
                                    نشر جميع المنتجات ({draftProducts.length})
                                </>
                            )}
                        </button>
                    </div>

                    {loadingDrafts ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-orange-600" />
                            <span className="mr-3 text-gray-600">جاري تحميل المنتجات...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">البراند</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الباركود</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر قبل</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر بعد</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {draftProducts.map((product, index) => {
                                        const isEditing = editingId === product.id;
                                        const displayProduct = isEditing ? editedProduct : product;
                                        
                                        return (
                                            <tr key={product.id} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editedProduct.image || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, image: e.target.value }))}
                                                            placeholder="رابط الصورة"
                                                            className="w-32 px-2 py-1 text-xs border border-gray-300 rounded"
                                                        />
                                                    ) : (
                                                        <img 
                                                            src={product.image || '/placeholder.png'} 
                                                            alt={product.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/placeholder.png';
                                                            }}
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editedProduct.name || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editedProduct.brand_name || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, brand_name: e.target.value }))}
                                                            placeholder="اسم البراند"
                                                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-blue-600 font-medium">{product.brand_name || '-'}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editedProduct.barcode || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, barcode: e.target.value }))}
                                                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-600">{product.barcode}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editedProduct.old_price || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, old_price: parseFloat(e.target.value) }))}
                                                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-sm text-gray-600">{product.old_price} ج.م</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editedProduct.price || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="text-green-600 font-bold text-sm">{product.price} ج.م</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                value={editedProduct.category || ''}
                                                                onChange={(e) => setEditedProduct(prev => ({ ...prev, category: e.target.value }))}
                                                                placeholder="التصنيف الأساسي"
                                                                className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={editedProduct.subcategory || ''}
                                                                onChange={(e) => setEditedProduct(prev => ({ ...prev, subcategory: e.target.value }))}
                                                                placeholder="التصنيف الثانوي"
                                                                className="w-32 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="font-medium text-sm">{product.category}</div>
                                                            {product.subcategory && (
                                                                <div className="text-xs text-gray-400">{product.subcategory}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editedProduct.stock_quantity || ''}
                                                            onChange={(e) => setEditedProduct(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                                                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    ) : (
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                            {product.stock_quantity}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {isEditing ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => saveProductChanges(product.id)}
                                                                disabled={savingId === product.id}
                                                                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                                            >
                                                                {savingId === product.id ? 'جاري الحفظ...' : 'حفظ'}
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                disabled={savingId === product.id}
                                                                className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 disabled:opacity-50"
                                                            >
                                                                إلغاء
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEdit(product)}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                        >
                                                            تعديل
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={publishAllProducts}
                            disabled={publishing}
                            className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-xl shadow-xl transform hover:scale-105"
                        >
                            {publishing ? (
                                <>
                                    <Loader className="w-7 h-7 animate-spin" />
                                    جاري النشر...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-7 h-7" />
                                    نشر {draftProducts.length} منتج إلى القائمة الرئيسية
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تعليمات الاستخدام</h3>
                <div className="space-y-3 text-gray-700">
                    <p className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">1.</span>
                        <span>حمّل قالب Excel من الأعلى للحصول على الصيغة الصحيحة (48 عمود)</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">2.</span>
                        <span>الأعمدة الأساسية: Barcode, Name, Price, Original Price, Category, Subcategory, Brand Name, Total Stock, Main Image, Expiry Date - باقي الأعمدة اختيارية</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">3.</span>
                        <span>احفظ الملف وارفعه هنا</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">4.</span>
                        <span>انتظر اكتمال المعالجة وراجع النتائج</span>
                    </p>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>نصيحة:</strong> للحصول على دليل تفصيلي كامل، راجع ملف 
                        <code className="mx-1 px-2 py-1 bg-blue-100 rounded">EXCEL_IMPORT_GUIDE.md</code>
                        في مجلد المشروع
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductImporter;
