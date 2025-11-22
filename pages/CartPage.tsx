import React from 'react';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const navigate = useNavigate();
    const cartItems = []; // Assume empty for now to match screenshot

    return (
        <div className="bg-white min-h-screen pb-24 md:pb-8 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">My Cart</h1>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block bg-white p-6 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                </div>
            </div>

            {/* Empty State */}
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty!</h2>
                <p className="text-gray-500 mb-8">Ready to shop? Your cart is waiting.</p>

                <div className="w-64 h-64 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                    {/* Placeholder for the cart illustration */}
                    <ShoppingCart size={80} className="text-gray-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        {/* Abstract background pattern could go here */}
                    </div>
                </div>

                {/* Bottom Action */}
                <button
                    onClick={() => navigate('/categories')}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors"
                >
                    Explore Categories
                </button>
            </div>
        </div>
    );
};

export default CartPage;
