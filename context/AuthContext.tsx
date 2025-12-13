import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { supabaseAuth } from '../services/supabaseAuth';
import { supabase } from '../services/supabaseClient';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isGuest?: boolean;
    loyaltyPoints?: number;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<User>;
    register: (data: any) => Promise<User>;
    loginAsGuest: () => User;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const mapSupabaseSessionToUser = (session: any): User => {
        const sUser = session?.user;
        return {
            id: sUser?.id || 'supabase-user',
            email: sUser?.email || '',
            name: sUser?.user_metadata?.full_name || sUser?.email?.split('@')[0] || 'Supabase User',
            avatar: sUser?.user_metadata?.avatar_url,
            role: 'customer',
            isGuest: false
        };
    };

    useEffect(() => {
        let cancelled = false;
        const hydrate = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            if (token && savedUser) {
                if (!cancelled) setUser(JSON.parse(savedUser));
                if (!cancelled) setLoading(false);
                return;
            }

            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser.isGuest && !cancelled) {
                    setUser(parsedUser);
                    setLoading(false);
                    return;
                }
            }

            try {
                const session = await supabaseAuth.getSession();
                if (session?.user) {
                    const mapped = mapSupabaseSessionToUser(session);
                    if (!cancelled) {
                        localStorage.setItem('token', session.access_token || 'supabase-session');
                        localStorage.setItem('user', JSON.stringify(mapped));
                        setUser(mapped);
                    }
                }
            } catch (e) {
                // ignore hydrate errors
            }
            if (!cancelled) setLoading(false);
        };
        hydrate();
        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (credentials: any): Promise<User> => {
        setLoading(true);
        try {
            const data = await api.auth.login(credentials);
            if (!data?.auth || !data?.user) {
                throw new Error(data?.message || data?.error || 'Login failed');
            }
            localStorage.setItem('token', data.token);
            const userWithGuestStatus = { ...data.user, isGuest: false };
            localStorage.setItem('user', JSON.stringify(userWithGuestStatus));
            setUser(userWithGuestStatus);
            return userWithGuestStatus; // Return user data for role-based navigation
        } finally {
            setLoading(false);
        }
    };

    const register = async (registerData: any): Promise<User> => {
        setLoading(true);
        try {
            const data = await api.auth.register(registerData);
            if (!data?.auth || !data?.user) {
                throw new Error(data?.message || data?.error || 'Registration failed');
            }
            localStorage.setItem('token', data.token);
            const userWithGuestStatus = { ...data.user, isGuest: false };
            localStorage.setItem('user', JSON.stringify(userWithGuestStatus));
            setUser(userWithGuestStatus);
            return userWithGuestStatus;
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = () => {
        const guestUser: User = {
            id: 'guest-' + Date.now(),
            name: 'Guest User',
            email: '',
            isGuest: true
        };
        localStorage.setItem('user', JSON.stringify(guestUser));
        setUser(guestUser);
        return guestUser;
    };

    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        try {
            await supabase.auth.signOut();
        } catch (e) {
            // ignore sign-out errors
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
