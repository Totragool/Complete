import { getAuthHeader } from '../utils/utils';
import { AuthService } from './AuthService';

const BASE_URL = 'http://localhost:8000';

export const api = {
    get: async (endpoint: string) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                AuthService.logout();
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error('API request failed');
            }

            return response.json();
        } catch (error) {
            console.error('API Get Error:', error);
            throw error;
        }
    },

    post: async (endpoint: string, data?: any) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                AuthService.logout();
                throw new Error('Unauthorized');
            }

            return response.json();
        } catch (error) {
            console.error('API Post Error:', error);
            throw error;
        }
    },

    put: async (endpoint: string, data: any) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                AuthService.logout();
                throw new Error('Unauthorized');
            }

            return response.json();
        } catch (error) {
            console.error('API Put Error:', error);
            throw error;
        }
    },

    delete: async (endpoint: string) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (response.status === 401) {
                AuthService.logout();
                throw new Error('Unauthorized');
            }

            return response.json();
        } catch (error) {
            console.error('API Delete Error:', error);
            throw error;
        }
    }
};