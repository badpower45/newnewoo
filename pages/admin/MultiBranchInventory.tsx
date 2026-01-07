import React, { useState, useEffect } from 'react';
import { Store, Package, ArrowRightLeft, AlertTriangle, History, Plus, Edit2, Trash2 } from 'lucide-react';
import { API_URL } from '../../src/config';

interface BranchInventory {
    branch_id: number;
    branch_name: string;
    price: number;
    discount_price: number | null;
    stock_quantity: number;
    reserved_quantity: number;
    expiry_date: string | null;
    is_available: boolean;
    min_stock_alert: number;
    last_stock_update: string | null;
    branch_notes: string | null;
    stock_status: string;
    available_quantity: number;
}

interface ProductWithBranches {
    product_id: string;
    product_name: string;
    category: string;
    subcategory: string;
    barcode: string;
    image: string;
    weight: string;
    branches: BranchInventory[];
}

interface StockMovement {
    id: number;
    product_id: string;
    product_name: string;
    from_branch_id: number;
    to_branch_id: number;
    from_branch_name: string;
    to_branch_name: string;
    quantity: number;
    movement_type: string;
    notes: string;
    performed_by_name: string;
    created_at: string;
}

const MultiBranchInventoryManager: React.FC = () => {
    const [products, setProducts] = useState<ProductWithBranches[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<ProductWithBranches | null>(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'alerts' | 'history'>('products');
    
    // Transfer form
    const [transferForm, setTransferForm] = useState({
        fromBranchId: '',
        toBranchId: '',
        quantity: 0,
        notes: ''
    });

    // Edit form
    const [editForm, setEditForm] = useState({
        branchId: '',
        price: 0,
        discountPrice: 0,
        stockQuantity: 0,
        minStockAlert: 5,
        expiryDate: '',
        branchNotes: '',
        isAvailable: true
    });

    useEffect(() => {
        loadProducts();
        loadLowStockAlerts();
        loadStockMovements();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/branch-products/all-branches`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.message === 'success') {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLowStockAlerts = async () => {
        try {
            const response = await fetch(`${API_URL}/branch-products/low-stock-alerts`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.message === 'success') {
                setLowStockAlerts(data.data);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    };

    const loadStockMovements = async (productId?: string) => {
        try {
            const url = productId 
                ? `${API_URL}/branch-products/stock-movements?productId=${productId}&limit=20`
                : `${API_URL}/branch-products/stock-movements?limit=50`;
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.message === 'success') {
                setStockMovements(data.data);
            }
        } catch (error) {
            console.error('Error loading stock movements:', error);
        }
    };

    const handleTransferStock = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProduct) return;
        
        if (!transferForm.fromBranchId || !transferForm.toBranchId) {
            alert('❌ يرجى اختيار الفروع');
            return;
        }
        
        if (transferForm.quantity <= 0) {
            alert('❌ يرجى إدخال كمية صحيحة');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/branch-products/transfer-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: selectedProduct.product_id,
                    fromBranchId: parseInt(transferForm.fromBranchId),
                    toBranchId: parseInt(transferForm.toBranchId),
                    quantity: transferForm.quantity,
                    notes: transferForm.notes
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('✅ ' + data.message);
                setShowTransferModal(false);
                setTransferForm({ fromBranchId: '', toBranchId: '', quantity: 0, notes: '' });
                loadProducts();
                loadStockMovements(selectedProduct.product_id);
            } else {
                alert('❌ ' + (data.error || 'حدث خطأ'));
            }
        } catch (error) {
            console.error('Error transferring stock:', error);
            alert('❌ حدث خطأ أثناء نقل المخزون');
        }
    };

    const handleUpdateBranchInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProduct || !editForm.branchId) return;

        try {
            const response = await fetch(`${API_URL}/branch-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: selectedProduct.product_id,
                    branchId: parseInt(editForm.branchId),
                    price: editForm.price,
                    discountPrice: editForm.discountPrice || null,
                    stockQuantity: editForm.stockQuantity,
                    minStockAlert: editForm.minStockAlert,
                    expiryDate: editForm.expiryDate || null,
                    branchNotes: editForm.branchNotes || null,
                    isAvailable: editForm.isAvailable
                })
            });

            const data = await response.json();
            
            if (data.message) {
                alert('✅ ' + data.message);
                setShowEditModal(false);
                loadProducts();
            } else {
                alert('❌ حدث خطأ');
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
            alert('❌ حدث خطأ أثناء التحديث');
        }
    };

    const openTransferModal = (product: ProductWithBranches) => {
        setSelectedProduct(product);
        setTransferForm({ fromBranchId: '', toBranchId: '', quantity: 0, notes: '' });
        setShowTransferModal(true);
        loadStockMovements(product.product_id);
    };

    const openEditModal = (product: ProductWithBranches, branch?: BranchInventory) => {
        setSelectedProduct(product);
        
        if (branch) {
            setEditForm({
                branchId: String(branch.branch_id),
                price: branch.price || 0,
                discountPrice: branch.discount_price || 0,
                stockQuantity: branch.stock_quantity || 0,
                minStockAlert: branch.min_stock_alert || 5,
                expiryDate: branch.expiry_date || '',
                branchNotes: branch.branch_notes || '',
                isAvailable: branch.is_available
            });
        } else {
            setEditForm({
                branchId: '',
                price: 0,
                discountPrice: 0,
                stockQuantity: 0,
                minStockAlert: 5,
                expiryDate: '',
                branchNotes: '',
                isAvailable: true
            });
        }
        
        setShowEditModal(true);
    };

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'متوفر': return 'text-green-600 bg-green-50';
            case 'مخزون منخفض': return 'text-yellow-600 bg-yellow-50';
            case 'نفذت الكمية': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">جاري التحميل...</div>;
    }

    return (
        <div className="container mx-auto p-6" dir="rtl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    <Store className="inline-block ml-2" />
                    إدارة المخزون - الفروع المتعددة
                </h1>
                <p className="text-gray-600">إدارة المنتجات وكمياتها عبر جميع الفروع</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-3 px-4 font-medium transition ${
                            activeTab === 'products'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Package className="inline-block ml-1" size={18} />
                        المنتجات والفروع
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`pb-3 px-4 font-medium transition ${
                            activeTab === 'alerts'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <AlertTriangle className="inline-block ml-1" size={18} />
                        تنبيهات المخزون ({lowStockAlerts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-4 font-medium transition ${
                            activeTab === 'history'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <History className="inline-block ml-1" size={18} />
                        سجل الحركات
                    </button>
                </nav>
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div className="space-y-4">
                    {products.map(product => (
                        <div key={product.product_id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={product.image} 
                                        alt={product.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{product.product_name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {product.category} | باركود: {product.barcode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        إضافة لفرع
                                    </button>
                                    <button
                                        onClick={() => openTransferModal(product)}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                                    >
                                        <ArrowRightLeft size={18} />
                                        نقل بين الفروع
                                    </button>
                                </div>
                            </div>

                            {/* Branches Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">الفرع</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">السعر</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">الكمية</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">المحجوز</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">المتاح</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">الحالة</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">آخر تحديث</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.branches.map(branch => (
                                            <tr key={`${product.product_id}-${branch.branch_id}`} className="border-t">
                                                <td className="px-4 py-3 font-medium">{branch.branch_name}</td>
                                                <td className="px-4 py-3">
                                                    {branch.price ? (
                                                        <span>{branch.price.toFixed(2)} ج.م</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {branch.stock_quantity !== null ? branch.stock_quantity : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {branch.reserved_quantity || 0}
                                                </td>
                                                <td className="px-4 py-3 font-bold">
                                                    {branch.available_quantity || 0}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${getStockStatusColor(branch.stock_status)}`}>
                                                        {branch.stock_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {branch.last_stock_update 
                                                        ? new Date(branch.last_stock_update).toLocaleDateString('ar-EG')
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    {branch.price !== null ? (
                                                        <button
                                                            onClick={() => openEditModal(product, branch)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openEditModal(product, branch)}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-semibold">المنتج</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">الفرع</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">الكمية المتبقية</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">الحد الأدنى</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockAlerts.map((alert, idx) => (
                                <tr key={idx} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">{alert.product_name}</td>
                                    <td className="px-4 py-3">{alert.branch_name}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-red-600">{alert.stock_quantity}</span>
                                    </td>
                                    <td className="px-4 py-3">{alert.min_stock_alert}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => {
                                                const product = products.find(p => p.product_id === alert.product_id);
                                                if (product) openEditModal(product);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            تحديث المخزون
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">المنتج</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">من فرع</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">إلى فرع</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">الكمية</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">بواسطة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockMovements.map((movement) => (
                                <tr key={movement.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(movement.created_at).toLocaleString('ar-EG')}
                                    </td>
                                    <td className="px-4 py-3">{movement.product_name}</td>
                                    <td className="px-4 py-3">{movement.from_branch_name || '-'}</td>
                                    <td className="px-4 py-3">{movement.to_branch_name || '-'}</td>
                                    <td className="px-4 py-3 font-bold">{movement.quantity}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            movement.movement_type === 'TRANSFER' ? 'bg-blue-100 text-blue-800' :
                                            movement.movement_type === 'ADJUSTMENT' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {movement.movement_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {movement.performed_by_name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTransferModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">
                            نقل مخزون: {selectedProduct.product_name}
                        </h2>
                        
                        <form onSubmit={handleTransferStock} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">من فرع</label>
                                    <select
                                        value={transferForm.fromBranchId}
                                        onChange={e => setTransferForm({ ...transferForm, fromBranchId: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">اختر الفرع</option>
                                        {selectedProduct.branches
                                            .filter(b => b.stock_quantity && b.stock_quantity > 0)
                                            .map(branch => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.branch_name} (متوفر: {branch.stock_quantity})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">إلى فرع</label>
                                    <select
                                        value={transferForm.toBranchId}
                                        onChange={e => setTransferForm({ ...transferForm, toBranchId: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">اختر الفرع</option>
                                        {selectedProduct.branches
                                            .filter(b => b.branch_id.toString() !== transferForm.fromBranchId)
                                            .map(branch => (
                                                <option key={branch.branch_id} value={branch.branch_id}>
                                                    {branch.branch_name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">الكمية</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={transferForm.quantity || ''}
                                    onChange={e => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) || 0 })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">ملاحظات (اختياري)</label>
                                <textarea
                                    value={transferForm.notes}
                                    onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-6 py-2 border rounded hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                                >
                                    <ArrowRightLeft size={18} />
                                    نقل المخزون
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">
                            {editForm.branchId ? 'تعديل' : 'إضافة'} مخزون: {selectedProduct.product_name}
                        </h2>
                        
                        <form onSubmit={handleUpdateBranchInventory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الفرع *</label>
                                <select
                                    value={editForm.branchId}
                                    onChange={e => setEditForm({ ...editForm, branchId: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">اختر الفرع</option>
                                    {selectedProduct.branches.map(branch => (
                                        <option key={branch.branch_id} value={branch.branch_id}>
                                            {branch.branch_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">السعر *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editForm.price || ''}
                                        onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">السعر قبل الخصم</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editForm.discountPrice || ''}
                                        onChange={e => setEditForm({ ...editForm, discountPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">الكمية *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.stockQuantity || ''}
                                        onChange={e => setEditForm({ ...editForm, stockQuantity: parseInt(e.target.value) || 0 })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">الحد الأدنى للتنبيه</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.minStockAlert || ''}
                                        onChange={e => setEditForm({ ...editForm, minStockAlert: parseInt(e.target.value) || 5 })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ الصلاحية</label>
                                <input
                                    type="date"
                                    value={editForm.expiryDate}
                                    onChange={e => setEditForm({ ...editForm, expiryDate: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">ملاحظات الفرع</label>
                                <textarea
                                    value={editForm.branchNotes}
                                    onChange={e => setEditForm({ ...editForm, branchNotes: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows={2}
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={editForm.isAvailable}
                                    onChange={e => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                                    className="ml-2"
                                />
                                <label htmlFor="isAvailable" className="text-sm font-medium">متاح للبيع</label>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 border rounded hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    حفظ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiBranchInventoryManager;
