import React, { useEffect } from 'react';
import { useBranch } from '../context/BranchContext';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface BranchSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({ isOpen, onClose }) => {
  const { branches, selectedBranch, loading, error, selectBranch, fetchBranches } = useBranch();

  useEffect(() => {
    if (isOpen && branches.length === 0) {
      fetchBranches();
    }
  }, [isOpen]);

  const handleSelectBranch = (branch: any) => {
    selectBranch(branch);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="اختر الفرع" size="medium">
      {loading ? (
        <LoadingSpinner message="جاري تحميل الفروع..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBranches} />
      ) : (
        <div className="space-y-3">
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
