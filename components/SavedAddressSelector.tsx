import React, { useState, useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import api from '../services/api';

interface Address {
    id: number;
    label: string;
    full_name: string;
    phone: string;
    governorate: string;
    city: string;
    area?: string;
    street: string;
    building?: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    notes?: string;
    is_default: boolean;
}

interface SavedAddressSelectorProps {
    userId: number;
    onSelect: (address: Address) => void;
}

const SavedAddressSelector: React.FC<SavedAddressSelectorProps> = ({ userId, onSelect }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAddresses();
    }, [userId]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await api.addresses.getAll(userId);
            const addressesData = response.data || response;
            setAddresses(addressesData);
            
            // Auto-select default address
            const defaultAddr = addressesData.find((addr: Address) => addr.is_default);
            if (defaultAddr) {
                setSelectedId(defaultAddr.id);
                onSelect(defaultAddr);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = (address: Address) => {
        setSelectedId(address.id);
        onSelect(address);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-600 mb-2">لا توجد عناوين محفوظة</p>
                <p className="text-sm text-gray-500">احفظ عنوانك لاستخدامه في الطلبات القادمة</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {addresses.map((address) => (
                <button
                    key={address.id}
                    type="button"
                    onClick={() => handleSelectAddress(address)}
                    className={`w-full text-right p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedId === address.id
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-lg ${
                            selectedId === address.id ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                            <MapPin className={`w-5 h-5 ${
                                selectedId === address.id ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">{address.label}</span>
                                {address.is_default && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                        افتراضي
                                    </span>
                                )}
                                {selectedId === address.id && (
                                    <Check className="w-5 h-5 text-purple-600 mr-auto" />
                                )}
                            </div>
                            
                            <p className="text-sm font-medium text-gray-800 mb-1">
                                {address.full_name} • {address.phone}
                            </p>
                            
                            <p className="text-sm text-gray-600">
                                {[
                                    address.building && `بناية ${address.building}`,
                                    address.floor && `طابق ${address.floor}`,
                                    address.apartment && `شقة ${address.apartment}`,
                                    address.street,
                                    address.area,
                                    address.city,
                                    address.governorate
                                ].filter(Boolean).join(', ')}
                            </p>
                            
                            {address.landmark && (
                                <p className="text-xs text-gray-500 mt-1">
                                    معلم مميز: {address.landmark}
                                </p>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default SavedAddressSelector;
