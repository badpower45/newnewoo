import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader, Download } from 'lucide-react';
import { api } from '../../services/api';
import { API_URL } from '../../src/config';

const ProductUploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.products.upload(formData);
            if (response.error) {
                setError(response.error);
            } else {
                setResult(response);
            }
        } catch (err) {
            setError("Failed to upload file. Please try again.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/excel/template`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to download template');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'products_template_with_brands.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading template:', err);
            setError('فشل تحميل القالب. حاول مرة أخرى.');
        }
    };

    const exportProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/excel/export`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to export products');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const today = new Date().toISOString().split('T')[0];
            link.download = `products_export_${today}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting products:', err);
            setError('فشل تصدير المنتجات. حاول مرة أخرى.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">رفع المنتجات عبر Excel</h1>
                <div className="flex gap-2">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download size={18} />
                        <span>تحميل القالب</span>
                    </button>
                    <button
                        onClick={exportProducts}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} />
                        <span>تصدير المنتجات</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileSpreadsheet size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-2">
                        {file ? file.name : "Click to select or drag and drop Excel file"}
                    </p>
                    <p className="text-xs text-gray-400">Supported formats: .xlsx, .xls</p>
                </div>

                {file && (
                    <div className="mt-6">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-colors ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-orange hover:bg-orange-700'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    <span>Upload Products</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-start space-x-3">
                        <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold">Upload Successful!</p>
                            <p className="text-sm mt-1">
                                Processed {result.stats.total} rows.
                                <br />
                                Success: {result.stats.success}, Errors: {result.stats.errors}
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center space-x-3">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3">📋 التعليمات</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                        <li>الملف يجب أن يكون بصيغة .xlsx أو .xls</li>
                        <li>أول صف يجب أن يكون عناوين الأعمدة</li>
                        <li><strong>الأعمدة المطلوبة:</strong> name (اسم المنتج), price (السعر)</li>
                        <li><strong>أعمدة اختيارية:</strong> category, subcategory, image, weight, barcode, brand_id (البراند), stock_quantity</li>
                        <li><strong>للبراند:</strong> استخدم عمود "البراند" أو "brand_id" واكتب رقم البراند من جدول المرجع</li>
                        <li><strong>نصيحة:</strong> حمل القالب أولاً لترى الأعمدة المطلوبة، أو صدّر المنتجات الموجودة كمثال</li>
                    </ul>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            💡 <strong>ملاحظة:</strong> القالب يحتوي على ورقتين - ورقة المنتجات وورقة مرجع البراندات لمساعدتك في اختيار البراند الصحيح
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductUploadPage;
