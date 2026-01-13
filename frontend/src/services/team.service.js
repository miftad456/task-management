import api from './api';

const teamService = {
    createTeam: async (name) => {
        const response = await api.post('/teams', { name });
        return response.data.data;
    },

    addMember: async (teamId, identifier) => {
        const response = await api.post(`/teams/${teamId}/member`, { username: identifier });
        return response.data.data;
    },

    removeMember: async (teamId, identifier) => {
        const response = await api.delete(`/teams/${teamId}/member`, { data: { username: identifier } });
        return response.data.data;
    },

    getTeamById: async (teamId) => {
        const response = await api.get(`/teams/${teamId}`);
        return response.data.data;
    },

    getManagerTeams: async () => {
        const response = await api.get('/teams/manager/all');
        return response.data.data;
    },

    getMemberTeams: async () => {
        const response = await api.get('/teams/member/all');
        return response.data.data;
    },

    requestLeave: async (teamId) => {
        const response = await api.delete(`/teams/${teamId}/leave`);
        return response.data.data;
    },

    getLeaveRequests: async (teamId, status = 'pending') => {
        const response = await api.get(`/teams/${teamId}/leave-requests?status=${status}`);
        return response.data.data;
    },

    approveLeave: async (teamId, requestId) => {
        const response = await api.put(`/teams/${teamId}/leave-request/${requestId}/approve`);
        return response.data.data;
    },

    rejectLeave: async (teamId, requestId) => {
        const response = await api.put(`/teams/${teamId}/leave-request/${requestId}/reject`);
        return response.data.data;
    },

    deleteTeam: async (teamId) => {
        const response = await api.delete(`/teams/${teamId}`);
        return response.data.data;
    },

    getManagerStats: async () => {
        const response = await api.get('/teams/manager/stats');
        return response.data.data;
    },

    // --- TEAM PROFILE SECTION (Corrected Paths) ---

    // GET /teams/profile/:teamId
    getTeamProfile: async (teamId) => {
        const response = await api.get(`/teams/profile/${teamId}`);
        return response.data.data;
    },

    // PUT /teams/profile/update/:teamId
    updateTeamProfile: async (teamId, data) => {
        const response = await api.put(`/teams/profile/update/${teamId}`, data);
        return response.data.data;
    },

    // POST /teams/profile/picture/:teamId
    uploadTeamProfilePicture: async (teamId, file) => {
        const formData = new FormData();
        formData.append('picture', file);

        const response = await api.post(`/teams/profile/picture/${teamId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },
    // PUT /teams/leave-requests/:requestId/approve
    approveLeaveRequest: async (requestId) => {
        const response = await api.put(`/teams/leave-requests/${requestId}/approve`);
        return response.data.data;
    },

    // PUT /teams/leave-requests/:requestId/reject
    rejectLeaveRequest: async (requestId) => {
        const response = await api.put(`/teams/leave-requests/${requestId}/reject`);
        return response.data.data;
    },
};

export default teamService;