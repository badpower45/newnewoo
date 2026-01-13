import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, Eye, Plus } from 'lucide-react';
import api from '../../services/api';

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
            const response = await api.products.getFrames();
            setFrames(response.data || []);
        } catch (error) {
            console.error('Error loading frames:', error);
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
            if (file.size > 500 * 1024) {
                alert('⚠️ حجم الملف يجب أن يكون أقل من 500KB');
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

        const formData = new FormData();
        formData.append('frame', selectedFile);
        formData.append('name', frameName);
        formData.append('name_ar', frameNameAr);
        formData.append('category', frameCategory);

        try {
            setLoading(true);
            await api.products.uploadFrame(formData);
            alert('✅ تم رفع الإطار بنجاح!');
            setUploadModalOpen(false);
            resetForm();
            loadFrames();
        } catch (error) {
            console.error('Error uploading frame:', error);
            alert('❌ فشل رفع الإطار');
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

    const resetForm = () => {
        setSelectedFile(null);
        setPreview('');
        setFrameName('');
        setFrameNameAr('');
        setFrameCategory('general');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">إدارة إطارات المنتجات</h1>
                            <p className="text-gray-600 mt-2">رفع وإدارة إطارات PNG الشفافة</p>
                        </div>
                        <button
                            onClick={() => setUploadModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            رفع إطار جديد
                        </button>
                    </div>

                    {/* المواصفات الموصى بها */}
                    <div className="mt-4 bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                        <h3 className="font-bold text-blue-800 mb-2">📐 المواصفات الموصى بها:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>✅ <strong>الحجم:</strong> 500 × 500 بكسل (مربع)</li>
                            <li>✅ <strong>النوع:</strong> PNG شفاف (Transparent)</li>
                            <li>✅ <strong>الحجم:</strong> أقل من 500KB</li>
                            <li>✅ <strong>الاستخدام:</strong> يظهر فوق صورة المنتج مباشرة</li>
                        </ul>
                    </div>
                </div>

                {/* Frames Grid */}
                {loading && frames.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
                        <p className="mt-4 text-gray-600">جاري التحميل...</p>
                    </div>
                ) : frames.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد إطارات</h3>
                        <p className="text-gray-500">ابدأ برفع أول إطار PNG</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {frames.map((frame) => (
                            <div key={frame.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Frame Preview */}
                                <div className="relative h-48 bg-gray-100">
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
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 mb-1">{frame.name_ar}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{frame.name}</p>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-brand-orange/10 text-brand-orange text-xs rounded-full">
                                            {frame.category}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <a
                                            href={frame.frame_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-600 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            عرض
                                        </a>
                                        <button
                                            onClick={() => handleDelete(frame.id)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold">رفع إطار جديد</h3>
                            <button
                                onClick={() => {
                                    setUploadModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* اسم الإطار بالإنجليزي */}
                            <div>
                                <label className="block text-sm font-medium mb-2">اسم الإطار (EN) *</label>
                                <input
                                    type="text"
                                    value={frameName}
                                    onChange={(e) => setFrameName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange"
                                    placeholder="Gold Border"
                                />
                            </div>

                            {/* اسم الإطار بالعربي */}
                            <div>
                                <label className="block text-sm font-medium mb-2">اسم الإطار (AR) *</label>
                                <input
                                    type="text"
                                    value={frameNameAr}
                                    onChange={(e) => setFrameNameAr(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange"
                                    placeholder="إطار ذهبي"
                                    dir="rtl"
                                />
                            </div>

                            {/* الفئة */}
                            <div>
                                <label className="block text-sm font-medium mb-2">الفئة</label>
                                <select
                                    value={frameCategory}
                                    onChange={(e) => setFrameCategory(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange"
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
                                <label className="block text-sm font-medium mb-2">صورة PNG الشفافة *</label>
                                <input
                                    type="file"
                                    accept="image/png"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    500×500 بكسل، PNG فقط، أقل من 500KB
                                </p>
                            </div>

                            {/* معاينة */}
                            {preview && (
                                <div className="border-2 border-dashed rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">معاينة:</p>
                                    <div className="relative w-64 h-64 mx-auto">
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
                                className="w-full py-3 bg-brand-orange text-white rounded-lg font-bold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                            >
                                <Upload className="w-5 h-5" />
                                {loading ? 'جاري الرفع...' : 'رفع الإطار'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductFramesManager;
