import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, Eye, Plus } from 'lucide-react';
import api from '../../services/api';
import '../../styles/admin-responsive.css';

interface Frame {
    id: number;
    name: string;
    name_ar: string;
    frame_url: string;
    category: string;
    is_active: boolean;
    created_at: string;
}

const ProductFramesManager: React.FC = () => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [frameName, setFrameName] = useState('');
    const [frameNameAr, setFrameNameAr] = useState('');
    const [frameCategory, setFrameCategory] = useState('general');

    useEffect(() => {
        loadFrames();
    }, []);

    const loadFrames = async () => {
        try {
            setLoading(true);
            console.log('📥 Loading frames...');
            const response = await api.products.getFrames();
            console.log('📦 Frames response:', response);
            const framesList = response.data || [];
            console.log('✅ Loaded frames count:', framesList.length);
            setFrames(framesList);
        } catch (error) {
            console.error('❌ Error loading frames:', error);
            alert('فشل تحميل الإطارات');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'image/png') {
                alert('⚠️ يرجى اختيار صورة PNG فقط');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('⚠️ حجم الملف يجب أن يكون أقل من 5MB');
                return;
            }
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !frameName || !frameNameAr) {
            alert('⚠️ يرجى ملء جميع الحقول واختيار صورة');
            return;
        }

        try {
            setLoading(true);
            
            // 🔥 تحويل لـ base64 للإرسال
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
            
            const frameBase64 = await base64Promise;
            console.log('📤 Uploading frame (will be uploaded to Cloudinary by backend)...');
            
            // إرسال JSON بدلاً من FormData
            const response = await fetch(`${api.API_URL}/products/upload-frame`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: frameName,
                    name_ar: frameNameAr,
                    category: frameCategory,
                    frame_base64: frameBase64
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || result.details || 'فشل رفع الإطار');
            }
            
            console.log('✅ Frame uploaded:', result);
            alert(`✅ تم رفع الإطار بنجاح!\n${result.data?.name || ''}`);
            setUploadModalOpen(false);
            resetForm();
            await loadFrames(); // Wait for frames to reload
        } catch (error: any) {
            console.error('Error uploading frame:', error);
            alert(`❌ فشل رفع الإطار: ${error.message || 'خطأ غير معروف'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (frameId: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإطار؟')) return;

        try {
            await api.products.deleteFrame(frameId);
            alert('✅ تم حذف الإطار');
            loadFrames();
        } catch (error) {
            console.error('Error deleting frame:', error);
            alert('❌ فشل حذف الإطار');
        }
    };

    const applyFrameToAllProducts = async (frameUrl: string, frameName: string) => {
        if (!confirm(`هل أنت متأكد من تطبيق إطار "${frameName}" على جميع المنتجات؟\n\nسيتم تطبيق الإطار على كل المنتجات الموجودة في النظام.`)) return;

        try {
            setLoading(true);
            const response = await fetch(`${api.API_URL}/products/apply-frame-to-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    frame_overlay_url: frameUrl,
                    frame_enabled: true
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(`✅ تم تطبيق الإطار بنجاح على ${result.updatedCount} منتج!`);
            } else {
                throw new Error(result.error || 'فشل تطبيق الإطار');
            }
        } catch (error) {
            console.error('Error applying frame:', error);
            alert('❌ فشل تطبيق الإطار على المنتجات');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreview('');
        setFrameName('');
        setFrameNameAr('');
        setFrameCategory('general');
    };

    return (
        <div className="admin-page-container">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="admin-card mb-4 sm:mb-6">
                    <div className="admin-card-header">
                        <div>
                            <h1 className="admin-page-title">إدارة إطارات المنتجات</h1>
                            <p className="admin-page-subtitle">رفع وإدارة إطارات PNG الشفافة</p>
                        </div>
                        <button
                            onClick={() => setUploadModalOpen(true)}
                            className="admin-btn-primary"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">رفع إطار جديد</span>
                            <span className="sm:hidden">رفع إطار</span>
                        </button>
                    </div>

                    {/* المواصفات الموصى بها */}
                    <div className="admin-alert admin-alert-info">
                        <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">📐 المواصفات الموصى بها:</h3>
                        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                            <li>✅ <strong>الحجم:</strong> 500 × 500 بكسل (مربع)</li>
                            <li>✅ <strong>النوع:</strong> PNG شفاف (Transparent)</li>
                            <li>✅ <strong>الحجم:</strong> أقل من 5MB</li>
                            <li className="hidden sm:list-item">✅ <strong>الاستخدام:</strong> يظهر فوق صورة المنتج مباشرة</li>
                        </ul>
                    </div>
                </div>

                {/* Frames Grid */}
                {loading && frames.length === 0 ? (
                    <div className="admin-empty-state">
                        <div className="admin-spinner"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">جاري التحميل...</p>
                    </div>
                ) : frames.length === 0 ? (
                    <div className="admin-card">
                        <div className="admin-empty-state">
                            <ImageIcon className="admin-empty-icon" />
                            <h3 className="admin-empty-title">لا توجد إطارات</h3>
                            <p className="admin-empty-text">ابدأ برفع أول إطار PNG</p>
                        </div>
                    </div>
                ) : (
                    <div className="admin-grid-4">
                        {frames.map((frame) => (
                            <div key={frame.id} className="admin-card p-0 overflow-hidden">
                                {/* Frame Preview */}
                                <div className="relative h-32 sm:h-40 md:h-48 bg-gray-100">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Background Product Image (Example) */}
                                        <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg opacity-50"></div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                            src={frame.frame_url}
                                            alt={frame.name_ar}
                                            className="w-40 h-40 object-contain"
                                        />
                                    </div>
                                    {!frame.is_active && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                            معطل
                                        </div>
                                    )}
                                </div>

                                {/* Frame Info */}
                                <div className="p-3 sm:p-4">
                                    <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base truncate">
                                        {frame.name_ar}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">
                                        {frame.name}
                                    </p>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="admin-badge-orange text-xs">
                                            {frame.category}
                                        </span>
                                    </div>

                                    {/* Actions - Stack on mobile */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <a
                                                href={frame.frame_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="admin-btn-secondary flex-1 text-xs sm:text-sm"
                                            >
                                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">عرض</span>
                                            </a>
                                            <button
                                                onClick={() => handleDelete(frame.id)}
                                                className="admin-btn-danger flex-1 text-xs sm:text-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                حذف
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => applyFrameToAllProducts(frame.frame_url, frame.name_ar)}
                                            disabled={loading}
                                            className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <span>✨</span>
                                            <span>تطبيق على جميع المنتجات</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-container">
                        {/* Modal Header */}
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">رفع إطار جديد</h3>
                            <button
                                onClick={() => {
                                    setUploadModalOpen(false);
                                    resetForm();
                                }}
                                className="admin-modal-close"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="admin-modal-body">
                            {/* اسم الإطار بالإنجليزي */}
                            <div>
                                <label className="admin-form-label">اسم الإطار (EN) *</label>
                                <input
                                    type="text"
                                    value={frameName}
                                    onChange={(e) => setFrameName(e.target.value)}
                                    className="admin-form-input"
                                    placeholder="Gold Border"
                                />
                            </div>

                            {/* اسم الإطار بالعربي */}
                            <div>
                                <label className="admin-form-label">اسم الإطار (AR) *</label>
                                <input
                                    type="text"
                                    value={frameNameAr}
                                    onChange={(e) => setFrameNameAr(e.target.value)}
                                    className="admin-form-input"
                                    placeholder="إطار ذهبي"
                                    dir="rtl"
                                />
                            </div>

                            {/* الفئة */}
                            <div>
                                <label className="admin-form-label">الفئة</label>
                                <select
                                    value={frameCategory}
                                    onChange={(e) => setFrameCategory(e.target.value)}
                                    className="admin-form-select"
                                >
                                    <option value="general">عام</option>
                                    <option value="premium">مميز</option>
                                    <option value="sale">تخفيض</option>
                                    <option value="new">جديد</option>
                                    <option value="organic">عضوي</option>
                                </select>
                            </div>

                            {/* رفع الملف */}
                            <div>
                                <label className="admin-form-label">صورة PNG الشفافة *</label>
                                <input
                                    type="file"
                                    accept="image/png"
                                    onChange={handleFileChange}
                                    className="admin-form-input"
                                />
                                <p className="admin-form-hint">
                                    500×500 بكسل، PNG فقط، أقل من 5MB
                                </p>
                            </div>

                            {/* معاينة */}
                            {preview && (
                                <div className="border-2 border-dashed rounded-lg p-3 sm:p-4">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">معاينة:</p>
                                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
                                        {/* خلفية تجريبية */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg"></div>
                                        {/* الإطار */}
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* زر الرفع */}
                            <button
                                onClick={handleUpload}
                                disabled={loading || !selectedFile || !frameName || !frameNameAr}
                                className="admin-btn-primary w-full"
                            >
                                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-sm sm:text-base">{loading ? 'جاري الرفع...' : 'رفع الإطار'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductFramesManager;
