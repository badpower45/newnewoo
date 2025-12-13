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

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/branches');
            setBranches(response.filter((b: Branch) => b.is_active));
        } catch (error) {
            console.error('Error fetching branches:', error);
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
            {/* Header */}
            <div className="bg-primary text-white p-6 pt-12">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Map size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">فروعنا</h1>
                        <p className="text-white/80">{branches.length} فرع في خدمتك</p>
                    </div>
                </div>
            </div>

            {/* Governorate Filter */}
            <div className="bg-white border-b p-4">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {governorates.map(gov => (
                        <button
                            key={gov}
                            onClick={() => setSelectedGovernorate(gov)}
                            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                                selectedGovernorate === gov
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {gov === 'all' ? 'كل المحافظات' : gov}
                        </button>
                    ))}
                </div>
            </div>

            {/* Branches List */}
            <div className="p-4 space-y-4">
                {filteredBranches.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <MapPin size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">لا توجد فروع</h3>
                        <p className="text-gray-500">لم نجد فروع في هذه المحافظة</p>
                    </div>
                ) : (
                    filteredBranches.map(branch => (
                        <div key={branch.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            {/* Branch Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{branch.name}</h3>
                                        <p className="text-sm text-gray-500">{branch.governorate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Branch Details */}
                            <div className="space-y-3 mb-4">
                                {/* Address */}
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-gray-700">
                                        {branch.address}, {branch.city}
                                    </p>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                                    <a 
                                        href={`tel:${branch.phone}`}
                                        className="text-primary font-medium hover:underline"
                                    >
                                        {branch.phone}
                                    </a>
                                </div>

                                {/* Opening Hours */}
                                {branch.opening_hours && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock size={16} className="text-gray-400 flex-shrink-0" />
                                        <p className="text-gray-700">{branch.opening_hours}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3 border-t">
                                <button
                                    onClick={() => handleGetDirections(branch)}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                                >
                                    <Navigation size={18} />
                                    الوصول للفرع
                                </button>
                                <button
                                    onClick={() => handleCall(branch.phone)}
                                    className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors flex items-center gap-2"
                                >
                                    <Phone size={18} />
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
