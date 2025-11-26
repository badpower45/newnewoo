import React from 'react';
import SidebarFilter from '../components/SidebarFilter';
import ProductCard from '../components/ProductCard';
import BarcodeScanner from '../components/BarcodeScanner';
import { Filter, Scan } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
    const [allProducts, setAllProducts] = React.useState<Product[]>([]);
    const [showScanner, setShowScanner] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        api.products.getAll().then(data => {
            if (data.data) {
                setAllProducts(data.data);
            }
        }).catch(err => console.error(err));
    }, []);

    const handleBarcodeScanned = async (barcode: string) => {
        console.log('Scanned barcode:', barcode);
        setShowScanner(false);

        try {
            const response = await api.products.getByBarcode(barcode);
            if (response.data) {
                // Navigate to product details page
                navigate(`/product/${response.data.id}`);
            } else {
                alert('المنتج غير موجود');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('حدث خطأ في البحث عن المنتج');
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <SidebarFilter />

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-brand-brown">كل المنتجات</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowScanner(true)}
                                className="flex items-center gap-2 bg-brand-orange text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                            >
                                <Scan size={18} /> مسح باركود
                            </button>
                            <button className="lg:hidden flex items-center gap-2 text-brand-orange font-bold border border-brand-orange px-4 py-2 rounded-lg">
                                <Filter size={18} /> تصفية
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {allProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>

            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
