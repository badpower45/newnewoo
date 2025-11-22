import React from 'react';
import { MapPin, ChevronDown, Search, ScanLine, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopBar = () => {
    return (
        <div className="bg-white p-4 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between md:space-x-8">

                {/* Logo & Location (Desktop) */}
                <div className="flex items-center justify-between mb-4 md:mb-0">
                    <Link to="/" className="text-2xl font-bold text-primary mr-8 hidden md:block">Aloosh</Link>

                    <div className="flex items-center space-x-2">
                        <MapPin className="text-primary w-5 h-5" />
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                                <span className="text-gray-500 text-sm">Deliver To :</span>
                                <ChevronDown className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-green-600 font-medium">Arrive within 75 mins</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative flex-grow max-w-2xl">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block pl-10 p-3"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer border-l border-gray-200 pl-3">
                        <ScanLine className="h-5 w-5 text-gray-800" />
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                        <ShoppingCart size={24} />
                        <span className="font-medium">Cart</span>
                    </Link>
                    <Link to="/more" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                        <User size={24} />
                        <span className="font-medium">Account</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
