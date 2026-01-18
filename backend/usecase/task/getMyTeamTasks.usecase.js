// usecase/task/getMyTeamTasks.usecase.js
// Team member use case: Get own tasks within a team context

export const getMyTeamTasksUsecase = (taskRepository, teamRepository) => {
    const getMyTeamTasks = async (teamId, userId) => {
        if (!teamId) throw new Error("Team ID is required");
        if (!userId) throw new Error("User ID is required");

        // 1. Verify team exists
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("Team not found");

        // 2. Verify user is either the manager or a team member
        const managerId = team.managerId?.id || team.managerId;
        const isManager = String(managerId) === String(userId);
        const isMember = team.members.some(m => String(m.id || m) === String(userId));

        if (!isManager && !isMember) {
            throw new Error("Access denied: You are not a member of this team");
        }

        // 3. Get user's tasks within this team
        const tasks = await taskRepository.findTeamTasksByUserId(teamId, userId);
        return tasks;
    };

    return { getMyTeamTasks };
};
