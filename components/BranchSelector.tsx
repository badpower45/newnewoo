import React, { useEffect, useState } from 'react';
import { useBranch } from '../context/BranchContext';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { Navigation, MapPin } from 'lucide-react';

interface BranchSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({ isOpen, onClose }) => {
  const { branches, selectedBranch, loading, error, selectBranch, fetchBranches, autoSelectByLocation } = useBranch();
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    if (isOpen && branches.length === 0) {
      fetchBranches();
    }
  }, [isOpen]);

  const handleSelectBranch = (branch: any) => {
    selectBranch(branch);
    onClose();
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleUseMyLocation = () => {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Find nearest branch manually
        if (branches.length === 0) {
          setLocError('لا توجد فروع متاحة');
          setLocating(false);
          return;
        }

        let nearest = branches[0];
        let minDistance = Infinity;

        branches.forEach(branch => {
          if (branch.latitude && branch.longitude) {
            const distance = calculateDistance(
              pos.coords.latitude,
              pos.coords.longitude,
              branch.latitude,
              branch.longitude
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearest = branch;
            }
          }
        });

        if (nearest) {
          selectBranch(nearest);
          onClose();
        } else {
          setLocError('لم يتم العثور على فرع مناسب لموقعك');
        }
        setLocating(false);
      },
      (err) => {
        setLocError(err.message || 'تعذر تحديد الموقع');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="اختر الفرع" size="medium">
      {loading ? (
        <LoadingSpinner message="جاري تحميل الفروع..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBranches} />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Navigation size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">اختر أقرب فرع تلقائياً</p>
              <p className="text-xs text-blue-700">نستخدم موقعك لاختيار الفرع الأنسب</p>
            </div>
            <button
              onClick={handleUseMyLocation}
              disabled={locating}
              className="px-3 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {locating ? '...جاري التحديد' : 'استخدم موقعي'}
            </button>
          </div>
          {locError && <p className="text-xs text-red-600">{locError}</p>}
          {branches.length === 0 ? (
            <p className="text-center text-gray-500 py-4">لا توجد فروع متاحة حالياً</p>
          ) : (
            branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                className={`w-full text-right p-4 rounded-lg border-2 transition ${
                  selectedBranch?.id === branch.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{branch.address}</p>
                    <p className="text-sm text-gray-500 mt-1">{branch.phone}</p>
                  </div>
                  {selectedBranch?.id === branch.id && (
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};

export default BranchSelector;
