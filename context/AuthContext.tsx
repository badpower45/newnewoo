import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    isGuest?: boolean;
    loyaltyPoints?: number;
}

interface AuthContextType {
    user: User | null;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    loginAsGuest: () => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        } else if (savedUser) {
            // Check for guest user persistence
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.isGuest) {
                setUser(parsedUser);
            }
        }
    }, []);

    const login = async (credentials: any) => {
        const data = await api.auth.login(credentials);
        if (data.auth) {
            localStorage.setItem('token', data.token);
            const userWithGuestStatus = { ...data.user, isGuest: false };
            localStorage.setItem('user', JSON.stringify(userWithGuestStatus));
            setUser(userWithGuestStatus);
        } else {
            throw new Error('Login failed');
        }
    };

    const register = async (registerData: any) => {
        const data = await api.auth.register(registerData);
        if (data.auth) {
            localStorage.setItem('token', data.token);
            const userWithGuestStatus = { ...data.user, isGuest: false };
            localStorage.setItem('user', JSON.stringify(userWithGuestStatus));
            setUser(userWithGuestStatus);

            return (
                <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, isAuthenticated: !!user }}>
                    {children}
                </AuthContext.Provider>
            );
        } else {
            throw new Error('Registration failed');
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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, isAuthenticated: !!user }}>
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
