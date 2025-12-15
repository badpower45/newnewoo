import React, { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, Phone, Clock, Navigation, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Branch {
    id: number;
    name: string;
    address: string;
    city: string;
    governorate: string;
    phone: string;
    email?: string;
    opening_hours?: string;
    google_maps_link?: string;
    is_active: boolean;
    latitude?: number;
    longitude?: number;
}

const BranchesPage = () => {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [nearestBranch, setNearestBranch] = useState<Branch | null>(null);

    useEffect(() => {
        fetchBranches();
        getUserLocation();
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error('Error getting location:', error)
            );
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    useEffect(() => {
        if (userLocation && branches.length > 0) {
            let nearest = branches[0];
            let minDistance = Infinity;

            branches.forEach(branch => {
                if (branch.latitude && branch.longitude) {
                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        branch.latitude,
                        branch.longitude
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = { ...branch, distance };
                    }
                }
            });

            setNearestBranch({ ...nearest, distance: minDistance } as any);
        }
    }, [userLocation, branches]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/branches');
            const branchData = response.data || response || [];
            setBranches(branchData.filter((b: Branch) => b.is_active));
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
        } finally {
            setLoading(false);
        }
    };

    const governorates = ['all', ...Array.from(new Set(branches.map(b => b.governorate)))];

    const filteredBranches = selectedGovernorate === 'all' 
        ? branches 
        : branches.filter(b => b.governorate === selectedGovernorate);

    const handleGetDirections = (branch: Branch) => {
        if (branch.google_maps_link) {
            window.open(branch.google_maps_link, '_blank');
        } else if (branch.latitude && branch.longitude) {
            window.open(`https://maps.google.com/?q=${branch.latitude},${branch.longitude}`, '_blank');
        } else {
            const address = encodeURIComponent(`${branch.address}, ${branch.city}, ${branch.governorate}`);
            window.open(`https://maps.google.com/?q=${address}`, '_blank');
        }
    };

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Simple Header */}
            <div className="bg-white border-b p-4 pt-12">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-3 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Map size={24} className="text-brand-orange" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">فروعنا</h1>
                        <p className="text-sm text-gray-500">{branches.length} فرع في خدمتك</p>
                    </div>
                </div>
            </div>

            {/* Nearest Branch - Simple Version */}
            {nearestBranch && userLocation && (
                <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Navigation size={18} className="text-green-600" />
                        <p className="text-sm font-medium text-green-900">أقرب فرع إليك</p>
                    </div>
                    <p className="font-bold text-gray-900">{nearestBranch.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                        📍 {nearestBranch.address}, {nearestBranch.city}
                    </p>
                    {(nearestBranch as any).distance && (
                        <p className="text-sm text-green-700 mt-1 font-medium">
                            {((nearestBranch as any).distance).toFixed(1)} كم
                        </p>
                    )}
                </div>
            )}

            {/* Simple Governorate Filter */}
            <div className="bg-white border-b p-3">
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {governorates.map(gov => (
                        <button
                            key={gov}
                            onClick={() => setSelectedGovernorate(gov)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                selectedGovernorate === gov
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {gov === 'all' ? 'الكل' : gov}
                        </button>
                    ))}
                </div>
            </div>

            {/* Simple Branches List */}
            <div className="p-4 space-y-3">
                {filteredBranches.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border">
                        <MapPin size={48} className="text-gray-300 mx-auto mb-3" />
                        <h3 className="font-bold text-base mb-1">لا توجد فروع</h3>
                        <p className="text-sm text-gray-500">لم نجد فروع في هذه المحافظة</p>
                    </div>
                ) : (
                    filteredBranches.map(branch => (
                        <div key={branch.id} className="bg-white rounded-xl p-4 shadow-sm border">
                            {/* Branch Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin size={20} className="text-brand-orange" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900">{branch.name}</h3>
                                    <p className="text-xs text-gray-500">{branch.governorate}</p>
                                </div>
                            </div>

                            {/* Branch Details */}
                            <div className="space-y-2 mb-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-700">{branch.address}, {branch.city}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                    <a 
                                        href={`tel:${branch.phone}`}
                                        className="text-brand-orange font-medium hover:underline"
                                    >
                                        {branch.phone}
                                    </a>
                                </div>

                                {branch.opening_hours && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400 flex-shrink-0" />
                                        <p className="text-gray-700">{branch.opening_hours}</p>
                                    </div>
                                )}
                            </div>

                            {/* Simple Actions */}
                            <div className="flex gap-2 pt-3 border-t">
                                <button
                                    onClick={() => handleGetDirections(branch)}
                                    className="flex-1 py-2.5 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Navigation size={16} />
                                    الوصول
                                </button>
                                <button
                                    onClick={() => handleCall(branch.phone)}
                                    className="px-5 py-2.5 border border-brand-orange text-brand-orange rounded-lg font-medium hover:bg-orange-50 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Phone size={16} />
                                    اتصال
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BranchesPage;
