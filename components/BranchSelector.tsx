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

        // Calculate distances for all branches (for display purposes)
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

        // Use the context's autoSelectByLocation for server-side calculation
        try {
          const nearest = await autoSelectByLocation(userPos.lat, userPos.lng);
          
          if (nearest) {
            const distance = distances.get(nearest.id);
            
            // Show success toast with distance
            const toast = document.createElement('div');
            toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce flex items-center gap-3';
            toast.innerHTML = `
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="font-bold">تم اختيار أقرب فرع ✓</p>
                <p class="text-xs opacity-90">${nearest.name}${distance ? ` - ${distance.toFixed(1)} كم` : ''}</p>
              </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
          
            onClose();
          } else {
            setLocError('لم يتم العثور على فرع مناسب لموقعك');
          }
        } catch (error) {
          console.error('Error auto-selecting branch:', error);
          setLocError('حدث خطأ أثناء تحديد الفرع');
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
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={16} className="text-gray-500" />
              <div>
                <p className="font-semibold text-gray-900">اختر الفرع الأقرب</p>
                <p className="text-xs text-gray-500">نعرض لك المنتجات المتوفرة في الفرع الذي تختاره</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-right text-sm text-gray-800 hover:border-green-400 hover:bg-white transition disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  {locating ? (
                    <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Navigation size={18} />
                  )}
                </div>
                <div className="leading-tight">
                  <p className="font-semibold">تحديد الفرع تلقائياً</p>
                  <p className="text-[11px] text-gray-500">نحدد أقرب فرع بناءً على موقعك</p>
                </div>
              </div>
              <span className="text-lg text-gray-400">→</span>
            </div>
          </button>

          {locError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              ⚠️ {locError}
            </div>
          )}

          <div className="flex items-center gap-3 px-1">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] text-gray-500">أو اختر يدوياً</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {branches.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">لا توجد فروع متاحة حالياً</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...branches].sort((a, b) => {
                const distA = branchDistances.get(a.id) ?? Infinity;
                const distB = branchDistances.get(b.id) ?? Infinity;
                return distA - distB;
              }).map((branch) => {
                const distance = branchDistances.get(branch.id);
                const nearestDistance = Math.min(...Array.from(branchDistances.values()).filter((v) => Number.isFinite(v)));
                const isNearest = distance !== undefined && distance === nearestDistance;

                return (
                  <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    className={`w-full rounded-xl border px-3 py-3 text-right transition ${
                      selectedBranch?.id === branch.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{branch.name}</h3>
                          {selectedBranch?.id === branch.id && (
                            <span className="rounded-full bg-green-500 px-2 py-[2px] text-[10px] font-bold text-white">مُختار</span>
                          )}
                          {isNearest && selectedBranch?.id !== branch.id && (
                            <span className="rounded-full bg-blue-100 px-2 py-[2px] text-[10px] font-semibold text-blue-700">الأقرب</span>
                          )}
                        </div>
                        <p className="flex items-center gap-1 text-[13px] text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          {branch.address}
                        </p>
                        {branch.phone && (
                          <p className="text-[12px] text-gray-500">📞 {branch.phone}</p>
                        )}
                        {branchDistances.has(branch.id) && (
                          <p className="text-[12px] font-medium text-green-700">البعد: {branchDistances.get(branch.id)?.toFixed(1)} كم</p>
                        )}
                      </div>
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BranchSelector;
