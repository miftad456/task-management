// usecase/task/getTeamTasks.usecase.js
// Manager use case: Get all tasks for a team

export const getTeamTasksUsecase = (taskRepository, teamRepository) => {
    const getTeamTasks = async (teamId, userId) => {
        if (!teamId) throw new Error("Team ID is required");
        if (!userId) throw new Error("User ID is required");

        // 1. Verify team exists
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("We cannot find this team");

        // 2. Verify requester is the team manager or a member
        const isManager = String(team.managerId.id || team.managerId) === String(userId);
        const isMember = (team.members || []).some(m => String(m.id || m) === String(userId));

        if (!isManager && !isMember) {
            throw new Error("Access denied: Only team members can view team tasks");
        }

        // 3. Get all tasks for this team
        const tasks = await taskRepository.findAllByTeamId(teamId);
        return tasks;
    };

    return { getTeamTasks };
};
