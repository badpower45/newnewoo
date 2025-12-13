import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton } from '../../components/Skeleton';
import { API_URL } from '../../src/config';

const emptyProduct = {
    barcode: '',
    name: '',
    price: 0,
    originalPrice: 0, // السعر قبل
    image: 'https://placehold.co/400x400?text=Product',
    category: 'Food',
    subcategory: '',
    expiryDate: '',
    branchId: 1,
    stockQuantity: 0,
    weight: '',
    rating: 0,
    reviews: 0,
    shelfLocation: ''
};

// Will be loaded from API
const defaultCategories = ['بقالة', 'ألبان', 'مشروبات', 'سناكس', 'زيوت', 'منظفات', 'عناية شخصية', 'مخبوزات', 'مجمدات', 'خضروات', 'فواكه', 'لحوم', 'أخرى'];

const sampleProducts: Product[] = [
    { id: 'p1001', name: 'لبن كامل الدسم 1 لتر', category: 'ألبان', price: 65, rating: 4.7, reviews: 120, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop', weight: '1 لتر' },
    { id: 'p1002', name: 'أرز مصري ممتاز', category: 'بقالة', price: 42, rating: 4.8, reviews: 300, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop', weight: '1 كجم' },
];

const ProductsManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyProduct);
    
    // Dynamic data from API
    const [branches, setBranches] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<{ [key: string]: any[] }>({});

    useEffect(() => {
        loadProducts();
        loadBranches();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            // Use branch 1 for admin preview since API requires branchId
            const data = await api.products.getAllByBranch(1);
            if (Array.isArray(data?.data)) setProducts(data.data);
            else if (Array.isArray(data)) setProducts(data);
            else setProducts(sampleProducts);
        } catch {
            setProducts(sampleProducts);
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await api.branches.getAll();
            console.log('📍 Branches loaded:', response);
            // Handle different response formats
            const branchData = response?.data || response || [];
            if (Array.isArray(branchData) && branchData.length > 0) {
                setBranches(branchData);
            } else {
                // Fallback to default branches
                setBranches([
                    { id: 1, name: 'الفرع الرئيسي', address: 'القاهرة' },
                    { id: 2, name: 'فرع المعادي', address: 'المعادي' },
                    { id: 3, name: 'فرع الإسكندرية', address: 'الإسكندرية' }
                ]);
            }
        } catch (error) {
            console.error('❌ Failed to load branches:', error);
            // Fallback to default branches
            setBranches([
                { id: 1, name: 'الفرع الرئيسي', address: 'القاهرة' },
                { id: 2, name: 'فرع المعادي', address: 'المعادي' },
                { id: 3, name: 'فرع الإسكندرية', address: 'الإسكندرية' }
            ]);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await api.categories.getAll();
            console.log('🗂️ Categories loaded:', response);
            // Handle different response formats
            const categoryData = response?.data || response || [];
            if (Array.isArray(categoryData) && categoryData.length > 0) {
                setCategories(categoryData);
                
                // Build subcategories map
                const subMap: { [key: string]: any[] } = {};
                categoryData.forEach((cat: any) => {
                    if (!cat.parent_id) {
                        // Main category - find its children
                        const children = categoryData.filter((c: any) => c.parent_id === cat.id);
                        subMap[cat.name] = children;
                        if (cat.name_ar) {
                            subMap[cat.name_ar] = children;
                        }
                    }
                });
                setSubcategories(subMap);
            } else {
                // Fallback to default
                setCategories(defaultCategories.map((name, idx) => ({ id: idx + 1, name, name_ar: name, parent_id: null })));
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            // Fallback to default
            setCategories(defaultCategories.map((name, idx) => ({ id: idx + 1, name, name_ar: name, parent_id: null })));
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.products.delete(id);
                loadProducts();
            } catch (err) {
                console.error("Failed to delete product", err);
                alert("Failed to delete product");
            }
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyProduct);
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({
            barcode: p.barcode || '',
            name: p.name,
            price: p.price,
            originalPrice: p.discount_price || p.originalPrice || 0,
            image: p.image,
            category: p.category,
            subcategory: p.subcategory || '',
            expiryDate: p.expiry_date || '',
            branchId: p.branch_id || 1,
            stockQuantity: p.stock_quantity || 0,
            weight: p.weight,
            rating: p.rating,
            reviews: p.reviews,
            shelfLocation: p.shelf_location || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const productData = {
                barcode: form.barcode,
                name: form.name,
                price: form.price,
                originalPrice: form.originalPrice,
                image: form.image,
                category: form.category,
                subcategory: form.subcategory,
                expiryDate: form.expiryDate,
                branchId: form.branchId,
                stockQuantity: form.stockQuantity,
                weight: form.weight,
                shelfLocation: form.shelfLocation
            };
            
            if (editing) {
                const result = await api.products.update(editing.id, productData);
                if (result.error) {
                    throw new Error(result.error);
                }
                alert('✅ تم تعديل المنتج بنجاح');
            } else {
                const result = await api.products.create(productData);
                if (result.error) {
                    throw new Error(result.message || result.error);
                }
                alert('✅ تم إضافة المنتج بنجاح');
            }
            setShowModal(false);
            loadProducts();
        } catch (err: any) {
            console.error('Failed to save product', err);
            const errorMessage = err.message || 'فشل حفظ المنتج';
            alert('❌ ' + errorMessage);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const seedBranches = async () => {
        try {
            console.log('🚀 Seeding branches to:', `${API_URL}/branches/dev/seed`);
            const res = await fetch(`${API_URL}/branches/dev/seed`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('❌ Response not OK:', res.status, text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            
            const json = await res.json();
            console.log('✅ Branches seeded:', json);
            alert('تم إضافة الفروع بنجاح');
            loadBranches();
        } catch (e) {
            console.error('❌ Branch seed failed:', e);
            alert('فشل إضافة الفروع: ' + (e instanceof Error ? e.message : 'خطأ غير معروف'));
        }
    };

    const seedCategories = async () => {
        try {
            console.log('🚀 Seeding categories to:', `${API_URL}/categories/dev/seed`);
            const res = await fetch(`${API_URL}/categories/dev/seed`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('❌ Response not OK:', res.status, text);
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
            
            const json = await res.json();
            console.log('✅ Categories seeded:', json);
            alert('تم إضافة التصنيفات بنجاح');
            loadCategories();
        } catch (e) {
            console.error('❌ Category seed failed:', e);
            alert('فشل إضافة التصنيفات: ' + (e instanceof Error ? e.message : 'خطأ غير معروف'));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={seedBranches}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus size={16} />
                        <span>إضافة فروع</span>
                    </button>
                    <button
                        onClick={seedCategories}
                        className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={16} />
                        <span>إضافة تصنيفات</span>
                    </button>
                    <button
                        onClick={async ()=>{
                            try {
                                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products/dev/seed-sample`, { method: 'POST' });
                                const j = await res.json();
                                console.log('Seed result', j);
                                loadProducts();
                            } catch (e) {
                                console.error('Seed failed', e);
                            }
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Upload size={16} />
                        <span>Seed Products</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/upload')}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Upload size={16} />
                        <span>Import Excel</span>
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center space-x-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                </div>
            </div>

            {/* Products Table */}
            {loading ? (
                <TableSkeleton rows={8} cols={7} />
            ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-4 font-semibold text-gray-600">المنتج</th>
                            <th className="px-4 py-4 font-semibold text-gray-600">الباركود</th>
                            <th className="px-4 py-4 font-semibold text-gray-600">التصنيف</th>
                            <th className="px-4 py-4 font-semibold text-gray-600">السعر قبل</th>
                            <th className="px-4 py-4 font-semibold text-gray-600">السعر بعد</th>
                            <th className="px-4 py-4 font-semibold text-gray-600">الكمية</th>
                            <th className="px-4 py-4 font-semibold text-gray-600 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-gray-600 text-sm">{product.barcode || '-'}</td>
                                <td className="px-4 py-4 text-gray-600">
                                    <div className="flex flex-col">
                                        <span>{product.category}</span>
                                        {product.subcategory && <span className="text-xs text-gray-400">{product.subcategory}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-gray-500 line-through">
                                    {product.discount_price || product.originalPrice ? `${(Number(product.discount_price) || Number(product.originalPrice) || 0).toFixed(2)} EGP` : '-'}
                                </td>
                                <td className="px-4 py-4 font-bold text-green-600">{(Number(product.price) || 0).toFixed(2)} EGP</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${(product.stock_quantity || 0) > 10 ? 'bg-green-100 text-green-700' : (product.stock_quantity || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock_quantity || 0} قطعة
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => openEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editing ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Barcode */}
                            <div>
                                <label className="block text-sm font-medium mb-1">الباركود</label>
                                <input
                                    type="text"
                                    value={form.barcode}
                                    onChange={e => setForm({ ...form, barcode: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="مثال: 6221155049784"
                                />
                            </div>
                            
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            {/* Prices Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">السعر قبل (الأصلي)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.originalPrice}
                                        onChange={e => setForm({ ...form, originalPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="السعر قبل الخصم"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">السعر بعد (الحالي) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1">صورة المنتج</label>
                                <div className="space-y-2">
                                    {/* Current Image Preview */}
                                    {form.image && (
                                        <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                                            <img 
                                                src={form.image} 
                                                alt="Product preview" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* File Upload */}
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    
                                                    // Show loading state
                                                    const originalImage = form.image;
                                                    setForm({ ...form, image: 'uploading...' });
                                                    
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('image', file);
                                                        formData.append('productId', form.barcode || `product_${Date.now()}`);
                                                        
                                                        const response = await fetch(`${API_URL}/upload/image`, {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        
                                                        const result = await response.json();
                                                        
                                                        if (result.success) {
                                                            setForm({ ...form, image: result.data.url });
                                                            alert('✅ تم رفع الصورة بنجاح!');
                                                        } else {
                                                            throw new Error(result.error || 'فشل رفع الصورة');
                                                        }
                                                    } catch (error) {
                                                        console.error('Upload error:', error);
                                                        alert('❌ فشل رفع الصورة: ' + error.message);
                                                        setForm({ ...form, image: originalImage });
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                                                📤 رفع صورة
                                            </div>
                                        </label>
                                        
                                        {/* Or URL Input */}
                                        <span className="text-gray-500">أو</span>
                                        <input
                                            type="text"
                                            value={form.image === 'uploading...' ? '' : form.image}
                                            onChange={e => setForm({ ...form, image: e.target.value })}
                                            className="flex-1 px-3 py-2 border rounded-md text-sm"
                                            placeholder="https://..."
                                            disabled={form.image === 'uploading...'}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        💡 يمكنك رفع صورة من جهازك أو إدخال رابط مباشر
                                    </p>
                                </div>
                            </div>

                            {/* Categories Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">التصنيف الأساسي *</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">اختر تصنيف</option>
                                        {categories.filter(cat => !cat.parent_id).map(cat => (
                                            <option key={cat.id || cat.name} value={cat.name_ar || cat.name}>
                                                {cat.name_ar || cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">التصنيف الفرعي</label>
                                    <select
                                        value={form.subcategory}
                                        onChange={e => setForm({ ...form, subcategory: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">اختر تصنيف فرعي</option>
                                        {(subcategories[form.category] || []).map(sub => (
                                            <option key={sub.id} value={sub.name_ar || sub.name}>
                                                {sub.name_ar || sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Expiry & Branch Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">تاريخ الصلاحية</label>
                                    <input
                                        type="date"
                                        value={form.expiryDate}
                                        onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">الفرع *</label>
                                    <select
                                        value={form.branchId}
                                        onChange={e => setForm({ ...form, branchId: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    >
                                        <option value="">اختر فرع</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name || branch.name_ar || `فرع ${branch.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Stock & Weight Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">عدد القطع المتوفرة</label>
                                    <input
                                        type="number"
                                        value={form.stockQuantity}
                                        onChange={e => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">الوزن/الحجم</label>
                                    <input
                                        type="text"
                                        value={form.weight}
                                        onChange={e => setForm({ ...form, weight: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="مثال: 1 كجم، 500 جم"
                                    />
                                </div>
                            </div>

                            {/* Shelf Location */}
                            <div>
                                <label className="block text-sm font-medium mb-1">موقع الرف (اختياري)</label>
                                <input
                                    type="text"
                                    value={form.shelfLocation}
                                    onChange={e => setForm({ ...form, shelfLocation: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="مثال: صف 3 - رف A"
                                />
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-700"
                                >
                                    {editing ? 'تحديث' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsManager;
