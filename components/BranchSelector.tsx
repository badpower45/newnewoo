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
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [branchDistances, setBranchDistances] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (isOpen && branches.length === 0) {
      fetchBranches();
    }
  }, [isOpen]);

  const handleSelectBranch = (branch: any) => {
    selectBranch(branch);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce flex items-center gap-3';
    toast.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="font-bold">تم تحديد الفرع ✓</p>
        <p class="text-xs opacity-90">سيتم عرض المنتجات من ${branch.name}</p>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
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
        const userPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(userPos);

        // Calculate distances for all branches
        const distances = new Map<number, number>();
        branches.forEach(branch => {
          if (branch.latitude && branch.longitude) {
            const distance = calculateDistance(
              userPos.lat,
              userPos.lng,
              branch.latitude,
              branch.longitude
            );
            distances.set(branch.id, distance);
          }
        });
        setBranchDistances(distances);

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
              userPos.lat,
              userPos.lng,
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
          
          // Show success toast with distance
          const toast = document.createElement('div');
          toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce flex items-center gap-3';
          toast.innerHTML = `
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="font-bold">تم اختيار أقرب فرع ✓</p>
              <p class="text-xs opacity-90">${nearest.name} - ${minDistance.toFixed(1)} كم</p>
            </div>
          `;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);
          
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
    <Modal isOpen={isOpen} onClose={onClose} title="📍 اختر الفرع الأقرب إليك" size="medium">
      {loading ? (
        <LoadingSpinner message="جاري تحميل الفروع..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBranches} />
      ) : (
        <div className="space-y-4">
          {/* Alert Banner - if no branch selected */}
          {!selectedBranch && (
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white animate-pulse">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-lg">لا يوجد فرع متاحة</h3>
                  <p className="text-xs text-orange-100">يرجى اختيار فرع لعرض المنتجات المتوفرة</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">اختر فرعك</h3>
                <p className="text-xs text-blue-100">سيتم عرض المنتجات المتوفرة في الفرع المختار</p>
              </div>
            </div>
          </div>

          {/* Auto Location Button - Prominent */}
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="w-full p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {locating ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Navigation size={28} className="text-white" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-base font-bold mb-1">🎯 اختر تلقائياً حسب موقعي</p>
                  <p className="text-sm text-green-100">سنختار أقرب فرع لك تلقائياً</p>
                </div>
              </div>
              <div className="text-2xl">
                {locating ? '⏳' : '→'}
              </div>
            </div>
          </button>
          
          {locError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 font-medium">⚠️ {locError}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500 font-medium">أو اختر يدوياً</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Branches List */}
          {branches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد فروع متاحة حالياً</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Sort branches by distance if available */}
              {[...branches].sort((a, b) => {
                const distA = branchDistances.get(a.id) ?? Infinity;
                const distB = branchDistances.get(b.id) ?? Infinity;
                return distA - distB;
              }).map((branch) => {
                const distance = branchDistances.get(branch.id);
                const isNearest = distance && distance === Math.min(...Array.from(branchDistances.values()));
                
                return (
                <button
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                    selectedBranch?.id === branch.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : isNearest
                      ? 'border-blue-400 bg-blue-50 hover:border-blue-500 hover:shadow-sm'
                      : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-base">{branch.name}</h3>
                        {selectedBranch?.id === branch.id && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                            ✓ مُختار
                          </span>
                        )}
                        {isNearest && selectedBranch?.id !== branch.id && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                            ⭐ الأقرب
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          {branch.address}
                        </p>
                        {branch.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            📞 {branch.phone}
                          </p>
                        )}
                        {branch.governorate && (
                          <p className="text-xs text-blue-600 font-medium">
                            📍 {branch.governorate}
                          </p>
                        )}
                        {/* Show distance if available */}
                        {branchDistances.has(branch.id) && (
                          <p className="text-xs text-green-600 font-bold flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md w-fit">
                            🎯 البعد: {branchDistances.get(branch.id)?.toFixed(1)} كم
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedBranch?.id === branch.id && (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              )})}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BranchSelector;
