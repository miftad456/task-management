import api from './api';

const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data.data;
    },

    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data.data;
    },

    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data.data;
    }
};

export default notificationService;
