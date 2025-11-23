import React from 'react';
import SidebarFilter from '../components/SidebarFilter';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';

export default function ProductsPage() {
    const [allProducts, setAllProducts] = React.useState<Product[]>([]);

    React.useEffect(() => {
        api.products.getAll().then(data => {
            if (data.data) {
                setAllProducts(data.data);
            }
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <SidebarFilter />

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-brand-brown">كل المنتجات</h1>
                        <button className="lg:hidden flex items-center gap-2 text-brand-orange font-bold border border-brand-orange px-4 py-2 rounded-lg">
                            <Filter size={18} /> تصفية
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {allProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
