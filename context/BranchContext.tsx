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
      // Use Supabase to fetch branches from database
      const { data, error: fetchError } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (fetchError) {
        console.error('Error fetching branches from Supabase:', fetchError);
        throw fetchError;
      }
      
      setBranches(data || []);
      
      // If no branch selected, select the first one
      if (!selectedBranch && data && data.length > 0) {
        selectBranch(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setError('فشل تحميل الفروع');
      setBranches([]);
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
      // Try Supabase RPC first
      const { data, error } = await supabase.rpc('select_branch_for_location', { lat, lng });
      
      if (error) {
        console.warn('Supabase RPC failed, using fallback:', error);
        // Fallback: Calculate nearest branch manually
        return findNearestBranch(lat, lng);
      }
      
      const match = Array.isArray(data) ? data[0] : null;
      if (!match) {
        // Fallback if no match found
        return findNearestBranch(lat, lng);
      }

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
      // Final fallback
      return findNearestBranch(lat, lng);
    }
  };
  
  // Fallback: Calculate nearest branch using Haversine formula
  const findNearestBranch = async (lat: number, lng: number): Promise<Branch | null> => {
    try {
      if (branches.length === 0) {
        await fetchBranches();
      }
      
      if (branches.length === 0) return null;
      
      // Haversine formula to calculate distance
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
      
      // Find nearest branch
      let nearest: Branch | null = null;
      let minDistance = Infinity;
      
      for (const branch of branches) {
        if (branch.latitude && branch.longitude) {
          const distance = calculateDistance(lat, lng, branch.latitude, branch.longitude);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = branch;
          }
        }
      }
      
      if (nearest) {
        selectBranch(nearest);
        return nearest;
      }
      
      // If no branch has coordinates, select first active branch
      const firstActive = branches.find(b => b.is_active !== false);
      if (firstActive) {
        selectBranch(firstActive);
        return firstActive;
      }
      
      return null;
    } catch (err) {
      console.error('findNearestBranch error:', err);
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
