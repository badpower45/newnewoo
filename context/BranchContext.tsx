import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  coverage_radius_km?: number;
  governorate?: string;
  city?: string;
  pickup_enabled?: boolean;
  is_active?: boolean;
}

interface BranchContextType {
  selectedBranch: Branch | null;
  branches: Branch[];
  loading: boolean;
  error: string | null;
  selectBranch: (branch: Branch) => void;
  fetchBranches: () => Promise<void>;
  findNearbyBranches: (lat: number, lng: number, radius?: number) => Promise<Branch[]>;
  autoSelectByLocation: (lat: number, lng: number) => Promise<Branch | null>;
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

  // Auto select branch using Supabase function (polygon/radius smart pick)
  const autoSelectByLocation = async (lat: number, lng: number): Promise<Branch | null> => {
    try {
      const { data, error } = await supabase.rpc('select_branch_for_location', { lat, lng });
      if (error) throw error;
      const match = Array.isArray(data) ? data[0] : null;
      if (!match) return null;

      // ensure we have full branch info
      if (branches.length === 0) {
        await fetchBranches();
      }
      const full = [...branches, selectedBranch].find((b) => b && b.id === match.branch_id) as Branch | undefined;
      const picked: Branch = full || {
        id: match.branch_id,
        name: match.name,
        address: match.city || match.governorate || 'فرع قريب',
        phone: '',
        city: match.city,
        governorate: match.governorate
      };

      selectBranch(picked);
      return picked;
    } catch (err) {
      console.error('autoSelectByLocation error', err);
      return null;
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
        findNearbyBranches,
        autoSelectByLocation
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
