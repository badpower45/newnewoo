import React from 'react';
import TopBar from '../components/TopBar';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/mockData';

const DealsPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <TopBar />
            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Hot Deals 🔥</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {PRODUCTS.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DealsPage;
