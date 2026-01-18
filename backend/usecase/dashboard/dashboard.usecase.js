export const getUserDashboardUsecase = (taskRepository) => {
    const getDashboard = async (userId) => {
        const [
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            dueTodayTasks,
        ] = await Promise.all([
            taskRepository.countByUser(userId),
            taskRepository.countByUserAndStatus(userId, "completed"),
            taskRepository.countByUserAndStatus(userId, "pending"),
            taskRepository.countOverdueByUser(userId),
            taskRepository.countDueTodayByUser(userId),
        ]);

        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            dueTodayTasks,
        };
    };

    return { getDashboard };
};

export const getTeamDashboardUsecase = (taskRepository, teamRepository) => {
    const getDashboard = async (teamId, requesterId) => {
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("We cannot find this team");

        const managerId = team.managerId?.id || team.managerId;
        if (String(managerId) !== String(requesterId)) {
            throw new Error("Access denied");
        }

        const [
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
        ] = await Promise.all([
            taskRepository.countByTeam(teamId),
            taskRepository.countByTeamAndStatus(teamId, "completed"),
            taskRepository.countByTeamAndStatus(teamId, "pending"),
            taskRepository.countOverdueByTeam(teamId),
        ]);

        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
        };
    };

    return { getDashboard };
};
