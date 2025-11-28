import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, X } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { useNavigate } from 'react-router-dom';

const emptyProduct = {
    name: '',
    price: 0,
    category: 'Food',
    weight: '',
    image: 'https://placehold.co/400x400?text=Product',
    rating: 0,
    reviews: 0
};

const categories = ['Food', 'Beverages', 'Snacks', 'Dairy', 'Cleaning', 'Personal Care', 'Bakery', 'Frozen', 'Other'];

const sampleProducts: Product[] = [
    { id: 'p1001', name: 'لبن كامل الدسم 1 لتر', category: 'Dairy', price: 65, rating: 4.7, reviews: 120, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop', weight: '1 لتر' },
    { id: 'p1002', name: 'أرز مصري ممتاز', category: 'Food', price: 42, rating: 4.8, reviews: 300, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop', weight: '1 كجم' },
    { id: 'p1003', name: 'شيبسي طماطم عائلي', category: 'Snacks', price: 15, rating: 4.5, reviews: 90, image: 'https://images.unsplash.com/photo-1613919085533-0a05360b1cbe?q=80&w=600&auto=format&fit=crop', weight: 'جامبو' },
    { id: 'p1004', name: 'بيبسي كانز 330 مل', category: 'Beverages', price: 12, rating: 4.9, reviews: 500, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=600&auto=format&fit=crop', weight: '330 مل' },
];

const ProductsManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyProduct);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        // Use branch 1 for admin preview since API requires branchId
        api.products.getAllByBranch(1)
            .then(data => {
                if (Array.isArray(data?.data)) setProducts(data.data);
                else if (Array.isArray(data)) setProducts(data);
                else setProducts(sampleProducts);
            })
            .catch(() => setProducts(sampleProducts));
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
            name: p.name,
            price: p.price,
            category: p.category,
            weight: p.weight,
            image: p.image,
            rating: p.rating,
            reviews: p.reviews
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.products.update(editing.id, form);
            } else {
                await api.products.create(form);
            }
            setShowModal(false);
            loadProducts();
        } catch (err) {
            console.error('Failed to save product', err);
            alert('Failed to save product');
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Product</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Price</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Stock</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{product.price.toFixed(2)} EGP</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">In Stock</span>
                                </td>
                                <td className="px-6 py-4 text-right">
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

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price (EGP)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Weight</label>
                                <input
                                    type="text"
                                    value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="e.g. 1kg, 500g"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image}
                                    onChange={e => setForm({ ...form, image: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-700"
                                >
                                    {editing ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
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
