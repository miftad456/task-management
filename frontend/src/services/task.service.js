import api from './api';

const taskService = {
    getAllTasks: async (search = '') => {
        const response = await api.get(`/tasks/fetch?search=${search}`);
        return response.data.data;
    },

    getTaskById: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data.data;
    },

    createTask: async (taskData) => {
        const response = await api.post('/tasks/create', taskData);
        return response.data.data;
    },

    updateTask: async (id, taskData) => {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data.data;
    },

    deleteTask: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/tasks/${id}/status`, { status });
        return response.data.data;
    },

    getDashboardStats: async () => {
        const response = await api.get('/dashboard');
        return response.data.data;
    },

    getUrgentTasks: async () => {
        const response = await api.get('/tasks/urgent');
        return response.data.data;
    },

    getOverdueTasks: async () => {
        const response = await api.get('/tasks/overdue');
        return response.data.data;
    },

    assignTask: async (taskData) => {
        if (taskData.file) {
            const formData = new FormData();
            Object.keys(taskData).forEach(key => {
                if (key === 'file') {
                    formData.append('file', taskData[key]);
                } else {
                    formData.append(key, taskData[key]);
                }
            });
            const response = await api.post('/tasks/assign', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data;
        }
        const response = await api.post('/tasks/assign', taskData);
        return response.data.data;
    },

    getAssignedTasks: async () => {
        const response = await api.get('/tasks/assigned');
        return response.data.data;
    },

    getTeamTasks: async (teamId) => {
        const response = await api.get(`/tasks/team/${teamId}/tasks`);
        return response.data.data;
    },

    getTeamDashboard: async (teamId) => {
        const response = await api.get(`/dashboard/team/${teamId}`);
        return response.data.data;
    },

    deleteCompletedTasks: async () => {
        const response = await api.delete('/tasks/completed');
        return response.data.data;
    },

    getTasksByStatus: async (status) => {
        const response = await api.get(`/tasks/fetch?status=${status}`);
        return response.data.data;
    }
};

export default taskService;
