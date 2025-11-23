import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { Product } from '../types';

const DealsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        api.products.getAll().then(data => {
            if (data.data) {
                setProducts(data.data);
            }
        }).catch(err => console.error(err));
    }, []);
    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <TopBar />
            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Hot Deals 🔥</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DealsPage;
