const baseUrl = 'http://localhost:8000/api';

interface LoginCredentials {
    email: string;
    password: string;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
}

export const AuthService = {
    // Login
    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to login');
            }

            const data = await response.json();
            
            // เก็บ token ใน localStorage
            localStorage.setItem('token', data.token);
            
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout
    async logout(): Promise<void> {
        try {
            await fetch(`${baseUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Logout error:', error);
            // ลบ token แม้จะ logout ไม่สำเร็จ
            localStorage.removeItem('token');
            throw error;
        }
    },

    // ตรวจสอบสถานะ authentication
    async checkAuth(): Promise<User | null> {
        try {
            const response = await fetch(`${baseUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    return null;
                }
                throw new Error('Failed to check auth status');
            }

            return response.json();
        } catch (error) {
            console.error('Auth check error:', error);
            return null;
        }
    },

    // ตรวจสอบว่าเป็น admin หรือไม่
    async checkAdminRole(userId: string): Promise<boolean> {
        try {
            const response = await fetch(`${baseUrl}/users/${userId}/role`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to check admin status');
            }

            const data = await response.json();
            return data.role === 'admin';
        } catch (error) {
            console.error('Admin check error:', error);
            return false;
        }
    },
};