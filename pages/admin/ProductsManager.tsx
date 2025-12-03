import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton } from '../../components/Skeleton';

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

const categories = ['بقالة', 'ألبان', 'مشروبات', 'سناكس', 'زيوت', 'منظفات', 'عناية شخصية', 'مخبوزات', 'مجمدات', 'خضروات', 'فواكه', 'لحوم', 'أخرى'];

const subcategories: { [key: string]: string[] } = {
    'بقالة': ['أرز', 'مكرونة', 'سكر', 'دقيق', 'بقوليات', 'توابل', 'معلبات', 'أخرى'],
    'ألبان': ['حليب', 'زبادي', 'جبن', 'زبدة', 'قشطة', 'أخرى'],
    'مشروبات': ['مياه', 'عصائر', 'مشروبات غازية', 'شاي', 'قهوة', 'أخرى'],
    'سناكس': ['شيبسي', 'بسكويت', 'شوكولاتة', 'مكسرات', 'أخرى'],
    'زيوت': ['زيت ذرة', 'زيت عباد الشمس', 'زيت زيتون', 'سمن', 'أخرى'],
    'منظفات': ['غسيل', 'أطباق', 'أرضيات', 'حمامات', 'أخرى'],
    'عناية شخصية': ['شامبو', 'صابون', 'معجون أسنان', 'مزيل عرق', 'أخرى'],
    'مخبوزات': ['خبز', 'كيك', 'كرواسون', 'أخرى'],
    'مجمدات': ['خضار مجمد', 'لحوم مجمدة', 'آيس كريم', 'أخرى'],
    'خضروات': ['طماطم', 'بطاطس', 'خيار', 'بصل', 'أخرى'],
    'فواكه': ['تفاح', 'موز', 'برتقال', 'عنب', 'أخرى'],
    'لحوم': ['دجاج', 'لحم بقري', 'لحم ضأن', 'أسماك', 'أخرى'],
    'أخرى': ['أخرى']
};

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

    useEffect(() => {
        loadProducts();
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
                await api.products.update(editing.id, productData);
            } else {
                await api.products.create(productData);
            }
            setShowModal(false);
            loadProducts();
        } catch (err) {
            console.error('Failed to save product', err);
            alert('فشل حفظ المنتج');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
                <div className="flex space-x-3">
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
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Upload size={18} />
                        <span>Seed Sample</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/upload')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Upload size={18} />
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

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium mb-1">لينك الصورة</label>
                                <input
                                    type="text"
                                    value={form.image}
                                    onChange={e => setForm({ ...form, image: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="https://..."
                                />
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
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
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
                                            <option key={sub} value={sub}>{sub}</option>
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
                                    <label className="block text-sm font-medium mb-1">الفرع</label>
                                    <select
                                        value={form.branchId}
                                        onChange={e => setForm({ ...form, branchId: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value={1}>الفرع الرئيسي</option>
                                        <option value={2}>فرع 2</option>
                                        <option value={3}>فرع 3</option>
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
