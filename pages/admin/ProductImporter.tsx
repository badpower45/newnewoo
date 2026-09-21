import React, { useState, useEffect } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader, Eye, Trash2, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { API_URL } from '../../src/config';

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    updated?: number;
    successCount?: number;
    failed: number;
    total: number;
    batchId?: string;
    published?: number;
    autoPublished?: boolean;
    details: {
        imported: any[];
        updated?: any[];
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
    const [uploadStep, setUploadStep] = useState<number>(0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [settingUp, setSettingUp] = useState(false);
    const [wiping, setWiping] = useState(false);
    const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
    const [loadingDrafts, setLoadingDrafts] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [publishProgress, setPublishProgress] = useState<{
        total: number;
        current: number;
        percent: number;
        isPublishing: boolean;
        done: boolean;
        message: string;
    }>({
        total: 0,
        current: 0,
        percent: 0,
        isPublishing: false,
        done: false,
        message: ''
    });
    const [autoPublish, setAutoPublish] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedProduct, setEditedProduct] = useState<Partial<DraftProduct>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const [recentBatches, setRecentBatches] = useState<any[]>([]);
    const navigate = useNavigate();

    // تحميل آخر الدفعات المرفوعة عند فتح الصفحة
    useEffect(() => {
        loadRecentBatches();
    }, []);

    const loadRecentBatches = async () => {
        try {
            const response = await fetch(`${API_URL}/products/drafts`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
                setRecentBatches(data.data);
            }
        } catch (err) {
            // Silently fail - recent batches is a convenience feature
        }
    };

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

    const handleWipeProducts = async () => {
        if (!confirm('⚠️ تحذير شديد الأهمية:\nهل أنت متأكد من رغبتك في مسح كافة المنتجات والمسودات من الموقع وقاعدة البيانات؟\n(سيتم الحفاظ على التصنيفات والبراندات وحسابات المستخدمين)')) {
            return;
        }
        const confirmation = prompt('لتأكيد الحذف النهائي، اكتب كلمة "مسح" في المربع أدناه:');
        if (confirmation !== 'مسح') {
            alert('تم إلغاء عملية المسح.');
            return;
        }
        setWiping(true);
        try {
            const response = await fetch(`${API_URL}/products/admin-wipe-all-products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('✅ ' + data.message);
                setDraftProducts([]);
                setResult(null);
                loadRecentBatches();
            } else {
                alert('❌ فشل المسح: ' + (data.error || data.message));
            }
        } catch (err) {
            console.error('Wipe error:', err);
            alert('❌ حدث خطأ أثناء تنفيذ المسح');
        } finally {
            setWiping(false);
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
        setUploadStep(1); // المرحلة 1: قراءة وتحليل الملف
        setResult(null);
        setDraftProducts([]);
        
        const stepTimer1 = setTimeout(() => setUploadStep(2), 600); // المرحلة 2: مطابقة التصنيفات والباركود
        const stepTimer2 = setTimeout(() => setUploadStep(3), 1400); // المرحلة 3: حفظ المسودات للمعاينة

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

            clearTimeout(stepTimer1);
            clearTimeout(stepTimer2);
            setUploadStep(3);

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
            setUploadStep(0);
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

        if (!confirm(`هل أنت متأكد من نشر ${draftProducts.length} منتج إلى القائمة الرئيسية للمتجر؟`)) {
            return;
        }

        const totalToPublish = draftProducts.length;
        setPublishProgress({
            total: totalToPublish,
            current: 0,
            percent: 0,
            isPublishing: true,
            done: false,
            message: 'جاري بدء النشر إلى المتجر...'
        });
        setPublishModalOpen(true);
        setPublishing(true);

        try {
            let totalPublished = 0;
            let remaining = totalToPublish;
            let attempts = 0;
            const batchLimit = 100; // Publish 100 products per chunk for smooth progress

            while (remaining > 0 && attempts < 50) {
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
                    break;
                }

                const chunkPublished = data.publishedCount || 0;
                totalPublished += chunkPublished;
                remaining = typeof data.remaining === 'number' ? data.remaining : 0;
                attempts += 1;

                const percent = Math.min(100, Math.round((totalPublished / totalToPublish) * 100));
                setPublishProgress(prev => ({
                    ...prev,
                    current: totalPublished,
                    percent: percent,
                    message: `تم نشر ${totalPublished} من ${totalToPublish} منتج (${percent}%)...`
                }));

                if (remaining === 0 || chunkPublished === 0) {
                    break;
                }
            }

            setPublishProgress(prev => ({
                ...prev,
                current: totalPublished,
                percent: 100,
                done: true,
                message: `تم نشر ${totalPublished} منتج بنجاح إلى المتجر!`
            }));

            if (remaining > 0) {
                await loadDraftProducts(result.batchId);
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
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleWipeProducts}
                            disabled={wiping}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                            title="مسح جميع المنتجات والمسودات من الموقع للبدء من جديد"
                        >
                            {wiping ? <Loader className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4 text-red-600" />}
                            {wiping ? 'جاري المسح...' : 'مسح المنتجات القديمة'}
                        </button>
                        <button
                            onClick={exportProducts}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            تصدير المنتجات
                        </button>
                        <button
                            onClick={() => navigate('/admin/drafts')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                        >
                            <Eye className="w-4 h-4" />
                            عرض المسودات
                        </button>
                        <button
                            onClick={setupDraftTable}
                            disabled={settingUp}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
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
                        
                        {uploading && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-right space-y-3 animate-pulse">
                                <div className="flex items-center justify-between text-sm font-semibold text-orange-900">
                                    <span className="flex items-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin text-orange-600" />
                                        جاري فحص وتحليل ملف المنتجات...
                                    </span>
                                    <span>المرحلة {uploadStep || 1} من 3</span>
                                </div>
                                <div className="w-full bg-orange-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-orange-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: uploadStep === 1 ? '33%' : uploadStep === 2 ? '66%' : '95%' }}
                                    />
                                </div>
                                <div className="text-xs text-orange-800 space-y-1 font-medium">
                                    <p className={uploadStep >= 1 ? 'font-bold text-orange-900' : 'opacity-60'}>
                                        {uploadStep >= 1 ? '✓' : '•'} المرحلة 1: قراءة وفحص صفوف الإكسيل بدقة
                                    </p>
                                    <p className={uploadStep >= 2 ? 'font-bold text-orange-900' : 'opacity-60'}>
                                        {uploadStep >= 2 ? '✓' : '•'} المرحلة 2: تنظيف الباركود ومطابقة التصنيفات والماركات
                                    </p>
                                    <p className={uploadStep >= 3 ? 'font-bold text-orange-900' : 'opacity-60'}>
                                        {uploadStep >= 3 ? '✓' : '•'} المرحلة 3: تجهيز وحفظ المسودات للمعاينة
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-md"
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        جاري التحليل والحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        {autoPublish ? 'رفع ونشر المنتجات مباشرة' : 'رفع وتحليل المنتجات للمعاينة'}
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
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">نتائج الاستيراد</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                            رقم الدفعة: {result.batchId?.slice(0, 8)}...
                        </span>
                    </div>
                    
                    {/* 4 Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* 1. إجمالي ملف الإكسيل */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-800">{result.total}</p>
                                    <p className="text-xs text-blue-600 font-medium">إجمالي صفوف الملف</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. تمت المعالجة بنجاح */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-800">
                                        {result.successCount || (result.imported + (result.updated || 0))}
                                    </p>
                                    <p className="text-xs text-green-600 font-medium">تمت المعالجة بنجاح</p>
                                    <span className="text-[11px] text-green-700 font-semibold block mt-0.5">
                                        ({result.imported} جديد • {result.updated || 0} محدّث)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. المسودات الجاهزة للنشر */}
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-800">{draftProducts.length}</p>
                                    <p className="text-xs text-purple-600 font-medium">مسودات جاهزة للنشر</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* 4. فشل أو استبعاد */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-800">{result.failed}</p>
                                    <p className="text-xs text-red-600 font-medium">أخطاء استبعاد</p>
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

            {/* Recently Uploaded Batches */}
            {recentBatches.length > 0 && !result && draftProducts.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                        آخر الحاجات اللي اترفعت
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الباركود</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentBatches.slice(0, 50).map((product: any, index: number) => (
                                    <tr key={product.id || index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded border border-gray-200"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">لا صورة</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{product.barcode || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{product.category || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-green-600 font-bold">{product.price} ج.م</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {product.stock_quantity || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                product.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {product.status === 'published' ? 'منشور' : 'مسودة'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {recentBatches.length > 50 && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => navigate('/admin/drafts')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                عرض جميع المسودات ({recentBatches.length})
                            </button>
                        </div>
                    )}
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

            {/* Live Publishing Progress Modal */}
            {publishModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border border-gray-100 animate-in fade-in zoom-in duration-200">
                        {/* Header Icon */}
                        {!publishProgress.done ? (
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-blue-100 shadow-inner">
                                <Loader className="w-10 h-10 animate-spin" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-100 shadow-sm animate-bounce">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                        )}

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {!publishProgress.done ? 'جاري نشر المنتجات إلى المتجر...' : '🎉 تم النشر بنجاح!'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 font-medium">
                            {!publishProgress.done
                                ? 'يتم الآن نقل وتفعيل المنتجات في قاعدة البيانات بدفعات سريعة'
                                : `تم نشر جميع المنتجات بنجاح (${publishProgress.current} منتج) وأصبحت معروضة الآن في المتجر!`}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 rounded-full h-4 mb-3 overflow-hidden shadow-inner p-0.5">
                            <div 
                                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-green-500 h-full rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${publishProgress.percent}%` }}
                            />
                        </div>

                        {/* Stats Row */}
                        <div className="flex justify-between items-center text-xs text-gray-600 font-semibold mb-6 px-1">
                            <span>
                                تم معالجة: <strong className="text-gray-900 font-bold">{publishProgress.current}</strong> من <strong className="text-gray-900 font-bold">{publishProgress.total}</strong>
                            </span>
                            <span className="text-blue-600 font-bold text-sm">{publishProgress.percent}%</span>
                        </div>

                        {/* Actions when done */}
                        {publishProgress.done ? (
                            <div className="flex gap-3 justify-center pt-2">
                                <button
                                    onClick={() => navigate('/admin/products')}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition"
                                >
                                    <span>الذهاب إلى قائمة المنتجات</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setPublishModalOpen(false);
                                        setResult(null);
                                        setDraftProducts([]);
                                        loadRecentBatches();
                                    }}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
                                >
                                    استيراد ملف جديد
                                </button>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 font-medium animate-pulse">
                                يرجى عدم إغلاق الصفحة حتى اكتمال عملية النشر...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductImporter;
