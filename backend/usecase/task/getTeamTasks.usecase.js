// usecase/task/getTeamTasks.usecase.js
// Manager use case: Get all tasks for a team

export const getTeamTasksUsecase = (taskRepository, teamRepository) => {
    const getTeamTasks = async (teamId, managerId) => {
        if (!teamId) throw new Error("Team ID is required");
        if (!managerId) throw new Error("Manager ID is required");

        // 1. Verify team exists
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("Team not found");

        // 2. Verify requester is the team manager
        if (String(team.managerId) !== String(managerId)) {
            throw new Error("Only the team manager can view all team tasks");
        }

        // 3. Get all tasks for this team
        const tasks = await taskRepository.findAllByTeamId(teamId);
        return tasks;
    };

    return { getTeamTasks };
};
