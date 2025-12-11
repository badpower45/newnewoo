import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../../services/api';

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    total: number;
    details: {
        imported: any[];
        validationErrors: any[];
        importErrors: any[];
    };
}

const ProductImporter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
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

        if (!validTypes.includes(file.type)) {
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
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk-import`, {
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
            } else {
                alert(`فشل الرفع: ${data.error || data.message}`);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('حدث خطأ أثناء رفع الملف');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk-import/template`, {
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

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">استيراد المنتجات من Excel</h1>
                <p className="text-gray-600">قم برفع ملف Excel يحتوي على بيانات المنتجات لإضافتها دفعة واحدة</p>
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
                    <div className="mt-6 flex justify-center">
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
                                    رفع وإضافة المنتجات
                                </>
                            )}
                        </button>
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

            {/* Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تعليمات الاستخدام</h3>
                <div className="space-y-3 text-gray-700">
                    <p className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">1.</span>
                        <span>حمّل قالب Excel من الأعلى للحصول على الصيغة الصحيحة (10 أعمدة)</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">2.</span>
                        <span>املأ جميع الأعمدة العشرة: اسم المنتج، الباركود، السعر قبل، السعر بعد، التصنيف الاساسي، التصنيف الثانوي، الفرع، الكميه، الصورة، تاريخ الصلاحيه</span>
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
