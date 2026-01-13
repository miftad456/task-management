import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,

    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/users/login', { username, password });
            const { user, token } = response.data.data;

            localStorage.setItem('accessToken', token.accessToken);
            localStorage.setItem('refreshToken', token.refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', loading: false });
            return false;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            await api.post('/users/register', userData);
            set({ loading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Registration failed', loading: false });
            return false;
        }
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) {
                await api.post('/users/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            set({ user: null, isAuthenticated: false });
        }
    },

    updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put('/users/profile/update', profileData);
            const updatedUser = response.data.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser, loading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Update failed', loading: false });
            return false;
        }
    },

    fetchUser: async () => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser?.id) return;

        try {
            const response = await api.get(`/users/${currentUser.id}`);
            const updatedUser = response.data.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    }
}));

export default useAuthStore;
