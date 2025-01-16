import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../interfaces/User';

interface UseAuthReturn {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    user: User | null;  // แก้ type
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null); // กำหนด type

    // ตรวจสอบสถานะ authentication เมื่อ component mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await AuthService.checkAuth();
                if (user) {
                    setUser(user);
                    setIsAuthenticated(true);
                    setIsAdmin(user.role === 'admin');
                } else {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const user = await AuthService.login({ email, password });
            setUser(user);
            setIsAuthenticated(true);
            setIsAdmin(user.role === 'admin');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isAuthenticated,
        isAdmin,
        isLoading,
        user,
        login,
        logout,
    };
};