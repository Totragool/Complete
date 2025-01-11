// services/auth.service.ts
import { SignInInterface } from '../interfaces/Authentication';
import { AuthResponse } from '../interfaces/Authentication';
import { User } from '../interfaces/Authentication';

const BASE_URL = "http://localhost:8000";

export const AuthService = {
    signIn: async (credentials: SignInInterface): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${BASE_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            return {
                status: response.status,
                data: data
            };
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('id');

        if (!token || !userId) {
            return null;
        }

        try {
            const response = await fetch(`${BASE_URL}/user/${userId}`, {
                headers: {
                    'Authorization': `${localStorage.getItem('token_type')} ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            return response.json();
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    },

    isAuthenticated: (): boolean => {
        return localStorage.getItem('token') !== null;
    },

    getRole: (): string | null => {
        return localStorage.getItem('role');
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    }
};