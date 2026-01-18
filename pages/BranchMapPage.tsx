import React, { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Navigation, Phone, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const BranchMapPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const branchId = searchParams.get('branchId');
    
    const [branch, setBranch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (branchId) {
            fetchBranchDetails();
        } else {
            setError('لم يتم تحديد الفرع');
            setLoading(false);
        }
    }, [branchId]);

    const fetchBranchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/branches/${branchId}`);
            setBranch(response.data || response);
        } catch (err) {
            setError('فشل في تحميل بيانات الفرع');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openInMaps = () => {
        if (branch?.location_lat && branch?.location_lng) {
            const url = `https://www.google.com/maps?q=${branch.location_lat},${branch.location_lng}`;
            window.open(url, '_blank');
        }
    };

    const getDirections = () => {
        if (branch?.location_lat && branch?.location_lng) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.location_lat},${branch.location_lng}`;
            window.open(url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الخريطة...</p>
                </div>
            </div>
        );
    }

    if (error || !branch) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                    <MapPin size={64} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل الموقع</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark"
                    >
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    const hasLocation = branch.location_lat && branch.location_lng;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">موقع الفرع</h1>
                        <p className="text-sm text-gray-500">Branch Location</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Branch Info Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <MapPin size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h2>
                            <p className="text-gray-600 mb-3">{branch.address || 'لا يوجد عنوان'}</p>
                            
                            {branch.phone && (
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <Phone size={16} />
                                    <a href={`tel:${branch.phone}`} className="hover:text-primary">
                                        {branch.phone}
                                    </a>
                                </div>
                            )}
                            
                            {branch.working_hours && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock size={16} />
                                    <span>{branch.working_hours}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                {hasLocation ? (
                    <>
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <iframe
                                src={`https://www.google.com/maps?q=${branch.location_lat},${branch.location_lng}&output=embed&z=15`}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Branch Location Map"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={openInMaps}
                                className="bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <MapPin size={20} />
                                عرض في الخرائط
                            </button>
                            <button
                                onClick={getDirections}
                                className="bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Navigation size={20} />
                                احصل على الاتجاهات
                            </button>
                        </div>

                        {/* Coordinates Info */}
                        <div className="bg-gray-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-600">
                                📍 الإحداثيات: {branch.location_lat?.toFixed(6)}, {branch.location_lng?.toFixed(6)}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center">
                        <MapPin size={48} className="text-amber-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-amber-900 mb-2">الموقع غير متوفر</h3>
                        <p className="text-amber-700">لم يتم تحديد موقع هذا الفرع بعد</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchMapPage;
