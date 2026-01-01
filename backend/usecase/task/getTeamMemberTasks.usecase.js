// usecase/task/getTeamMemberTasks.usecase.js
// Team member use case: Get tasks for a specific team member (read-only view)

export const getTeamMemberTasksUsecase = (taskRepository, teamRepository) => {
    const getTeamMemberTasks = async (teamId, targetUserId, requesterId) => {
        if (!teamId) throw new Error("Team ID is required");
        if (!targetUserId) throw new Error("Target User ID is required");
        if (!requesterId) throw new Error("Requester ID is required");

        // 1. Verify team exists
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("Team not found");

        // 2. Verify requester is either the team manager or a team member
        const isManager = String(team.managerId) === String(requesterId);
        const isMember = team.members.some(m => String(m) === String(requesterId));

        if (!isManager && !isMember) {
            throw new Error("Access denied: You must be a team manager or member to view team tasks");
        }

        // 3. Verify target user is a team member
        const isTargetMember = team.members.some(m => String(m) === String(targetUserId));
        if (!isTargetMember) {
            throw new Error("Target user is not a member of this team");
        }

        // 4. Get tasks for the target user within this team
        const tasks = await taskRepository.findTeamTasksByUserId(teamId, targetUserId);
        return tasks;
    };

    return { getTeamMemberTasks };
};
