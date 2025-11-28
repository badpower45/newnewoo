import React, { createContext, useContext, useState, useEffect } from 'react';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  delivery_radius: number;
  is_active: boolean;
}

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  loading: boolean;
  error: string | null;
  selectBranch: (branch: Branch) => void;
  fetchBranches: () => Promise<void>;
  findNearbyBranches: (lat: number, lng: number, radius?: number) => Promise<Branch[]>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

const BRANCH_STORAGE_KEY = 'lumina_selected_branch';

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selected branch from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(BRANCH_STORAGE_KEY);
    if (stored) {
      try {
        setSelectedBranch(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored branch:', e);
      }
    }
  }, []);

  // Fetch all branches
  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/branches`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data.data || data);
      
      // If no branch selected, select the first one
      if (!selectedBranch && data.data?.length > 0) {
        selectBranch(data.data[0]);
      }
    } catch (err) {
      // Silent fallback when backend unavailable
      setBranches([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Find nearby branches
  const findNearbyBranches = async (lat: number, lng: number, radius: number = 10): Promise<Branch[]> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/branches/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby branches');
      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error('Error finding nearby branches:', err);
      return [];
    }
  };

  // Select a branch
  const selectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branch));
  };

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <BranchContext.Provider
      value={{
        selectedBranch,
        branches,
        loading,
        error,
        selectBranch,
        fetchBranches,
        findNearbyBranches
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
