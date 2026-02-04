import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
    favorites: Product[];
    addFavorite: (product: Product) => void;
    removeFavorite: (productId: string | number) => void;
    isFavorite: (productId: string | number) => boolean;
    toggleFavorite: (product: Product) => void;
    loading: boolean;
    refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Load favorites from database when user changes
    const loadFavorites = async () => {
        // For guest users or no user, use localStorage only
        if (!user || user.isGuest) {
            const savedFavorites = localStorage.getItem('favorites');
            if (savedFavorites) {
                try {
                    setFavorites(JSON.parse(savedFavorites));
                } catch (e) {
                    console.error("Failed to parse favorites", e);
                }
            }
            return;
        }

        // For authenticated users, load from database
        setLoading(true);
        try {
            const response = await api.favorites.get(user.id);
            if (response.success && Array.isArray(response.data)) {
                setFavorites(response.data);
                // Also update localStorage as backup
                localStorage.setItem('favorites', JSON.stringify(response.data));
            }
        } catch (error: any) {
            // Silent fail for 401/403 errors - don't spam console
            if (error?.response?.status !== 401 && error?.response?.status !== 403) {
                console.error('Failed to load favorites from database:', error);
            }
            // Fallback to localStorage
            const savedFavorites = localStorage.getItem('favorites');
            if (savedFavorites) {
                try {
                    setFavorites(JSON.parse(savedFavorites));
                } catch (e) {
                    console.error("Failed to parse favorites", e);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, [user?.id]);

    // Save to localStorage whenever favorites change (backup)
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = async (product: Product) => {
        // Optimistically update UI
        setFavorites(prev => {
            if (prev.some(p => p.id === product.id)) return prev;
            return [...prev, product];
        });

        // If user is authenticated, save to database
        if (user && !user.isGuest) {
            try {
                await api.favorites.add(user.id, String(product.id));
            } catch (error: any) {
                // Silent fail for 401/403 errors
                if (error?.response?.status !== 401 && error?.response?.status !== 403) {
                    console.error('Failed to add favorite to database:', error);
                }
                // Don't revert - localStorage will keep it
            }
        }
    };

    const removeFavorite = async (productId: string | number) => {
        // Optimistically update UI
        setFavorites(prev => prev.filter(p => p.id !== productId));

        // If user is authenticated, remove from database
        if (user && !user.isGuest) {
            try {
                await api.favorites.remove(user.id, String(productId));
            } catch (error: any) {
                // Silent fail for 401/403 errors
                if (error?.response?.status !== 401 && error?.response?.status !== 403) {
                    console.error('Failed to remove favorite from database:', error);
                }
            }
        }
    };

    const isFavorite = (productId: string | number) => {
        return favorites.some(p => p.id === productId);
    };

    const toggleFavorite = (product: Product) => {
        if (isFavorite(product.id)) {
            removeFavorite(product.id);
        } else {
            addFavorite(product);
        }
    };

    const refreshFavorites = async () => {
        await loadFavorites();
    };

    return (
        <FavoritesContext.Provider value={{ 
            favorites, 
            addFavorite, 
            removeFavorite, 
            isFavorite, 
            toggleFavorite,
            loading,
            refreshFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
