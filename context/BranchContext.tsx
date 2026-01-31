import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { API_URL } from '../src/config';

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
      // Try backend API first
      const apiUrl = API_URL;
      console.log('🔍 Fetching branches from:', `${apiUrl}/branches`);
      
      const response = await fetch(`${apiUrl}/branches`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const result = await response.json();
      const branchesData = result.data || result;
      const activeBranches = Array.isArray(branchesData)
        ? branchesData.filter((branch: Branch) => branch.is_active !== false)
        : [];
      
      if (!branchesData || branchesData.length === 0) {
        throw new Error('No branches found');
      }
      
      console.log('✅ Branches loaded:', activeBranches.length);
      setBranches(activeBranches);
      
      // If no branch selected, select the first one
      if (!selectedBranch && activeBranches.length > 0) {
        selectBranch(activeBranches[0]);
      } else if (selectedBranch && selectedBranch.is_active === false && activeBranches.length > 0) {
        selectBranch(activeBranches[0]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch branches from API:', err);
      
      // Fallback: Use default branch
      const defaultBranch: Branch = {
        id: 1,
        name: 'Default',
        address: 'الفرع الرئيسي',
        phone: '01000000000',
        is_active: true
      };
      
      console.log('⚠️ Using fallback default branch');
      setBranches([defaultBranch]);
      
      if (!selectedBranch) {
        selectBranch(defaultBranch);
      }
      
      setError(null); // Don't show error to user, just use fallback
    } finally {
      setLoading(false);
    }
  };

  // Find nearby branches
  const findNearbyBranches = async (lat: number, lng: number, radius: number = 10): Promise<Branch[]> => {
    try {
      const response = await fetch(
        `${API_URL}/branches/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby branches');
      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error('Error finding nearby branches:', err);
      return [];
    }
  };

  // Auto select branch using nearest branch endpoint
  const autoSelectByLocation = async (lat: number, lng: number): Promise<Branch | null> => {
    try {
      const apiUrl = API_URL;
      console.log('📍 Finding nearest branch for location:', lat, lng);
      
      // Use the new nearest branch endpoint
      const response = await fetch(`${apiUrl}/branches/location/nearest?lat=${lat}&lng=${lng}`);
      
      if (!response.ok) {
        console.warn('Nearest branch API failed, using fallback');
        return findNearestBranch(lat, lng);
      }
      
      const result = await response.json();
      const branchData = result.data;
      
      if (!branchData) {
        console.warn('No branch found from API, using fallback');
        return findNearestBranch(lat, lng);
      }

      if (branchData.is_active === false) {
        console.warn('Nearest branch is inactive, using fallback');
        return findNearestBranch(lat, lng);
      }
      
      console.log('✅ Nearest branch found:', branchData.name, `(${result.distance_km?.toFixed(2) || '?'} km)`);
      
      const branch: Branch = {
        id: branchData.id,
        name: branchData.name,
        address: branchData.address || branchData.city || branchData.governorate || 'فرع قريب',
        phone: branchData.phone || '',
        latitude: branchData.latitude,
        longitude: branchData.longitude,
        coverage_radius_km: branchData.coverage_radius_km || branchData.delivery_radius,
        city: branchData.city,
        governorate: branchData.governorate,
        pickup_enabled: branchData.pickup_enabled,
        is_active: branchData.is_active
      };

      selectBranch(branch);
      return branch;
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
