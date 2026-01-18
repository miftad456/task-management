import api from './api';

const submissionService = {
    submitTask: async (taskId, link = '', note = '') => {
        const response = await api.post(`/submissions/task/${taskId}`, { link, note });
        return response.data.data;
    },

    reviewTask: async (taskId, action, note = '') => {
        const response = await api.put(`/submissions/task/${taskId}/review`, { action, note });
        return response.data.data;
    }
};

export default submissionService;
