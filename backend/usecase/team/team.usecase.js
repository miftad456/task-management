// src/usecase/team/team.usecase.js
import { Team } from "../../domain/entities/team.entity.js";

export const teamUsecase = ({ teamRepository, userRepository }) => {
  // Create a new team
  const createTeam = async (name, userId) => {
    if (!name) throw new Error("Team name is required");
    if (!userId) throw new Error("User ID is required");

    const existingTeams = await teamRepository.findByManager(userId);

    if (existingTeams.length === 0) {
      await userRepository.update(userId, { role: "manager" });
    }

    const team = new Team({
      name,
      managerId: userId,
    });

    return await teamRepository.create(team);
  };

  // Helper: resolve identifier (userId or username) to user object
  const resolveUser = async (identifier) => {
    if (!identifier) throw new Error("Missing user identifier");

    // If identifier looks like an ObjectId, try findById first
    if (String(identifier).match(/^[0-9a-fA-F]{24}$/)) {
      const found = await userRepository.findById(identifier);
      if (found) return found;
    }

    // else, try by username
    const byUsername = await userRepository.findByUsername(identifier);
    if (byUsername) return byUsername;

    throw new Error("User not found");
  };

  // Add member - returns both updated team and added user's username
  const addMember = async (teamId, identifier) => {
    if (!teamId || !identifier) throw new Error("Team ID and user identifier are required");

    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    const user = await resolveUser(identifier);

    const updatedTeam = await teamRepository.addMember(teamId, user.id);

    return {
      team: updatedTeam,
      addedUser: {
        id: user.id,
        username: user.username,
      },
    };
  };

  // Remove member - returns both updated team and removed user's username
  const removeMember = async (teamId, identifier) => {
    if (!teamId || !identifier) throw new Error("Team ID and user identifier are required");

    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    const user = await resolveUser(identifier);

    const updatedTeam = await teamRepository.removeMember(teamId, user.id);

    return {
      team: updatedTeam,
      removedUser: {
        id: user.id,
        username: user.username,
      },
    };
  };

  const getTeamById = async (teamId) => {
    if (!teamId) throw new Error("Team ID is required");
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");
    return team;
  };

  const getTeamsByManager = async (managerId) => {
    if (!managerId) throw new Error("Manager ID is required");
    return await teamRepository.findByManager(managerId);
  };

  const getTeamsByMember = async (userId) => {
    if (!userId) throw new Error("User ID is required");
    return await teamRepository.findByMember(userId);
  };

  const getTeamByName = async (managerId, name) => {
    if (!managerId) throw new Error("Manager ID is required");
    if (!name) throw new Error("Team name is required");

    const team = await teamRepository.findByManagerAndName(managerId, name);
    if (!team) throw new Error("Team not found");

    return team;
  };

  // ------------------------------------------------------
  //                     LEAVE SYSTEM
  // ------------------------------------------------------

  // 1️⃣ Member requests to leave
  const requestLeave = async (teamId, userId) => {
    if (!teamId || !userId) throw new Error("Team ID and User ID are required");

    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    // Ensure member belongs to the team
    if (!team.members.includes(String(userId))) {
      throw new Error("User is not a member of this team");
    }

    return await teamRepository.requestLeave(teamId, userId);
  };

  // 2️⃣ Manager fetches leave requests for his team
  //    Optional `status` param allowed: pending|approved|rejected|all
  const getLeaveRequests = async (teamId, managerId, status = "pending") => {
    if (!teamId || !managerId) throw new Error("Team ID and Manager ID required");

    const allowed = ["pending", "approved", "rejected", "all"];
    if (status && !allowed.includes(status)) throw new Error("Invalid status filter");

    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    if (String(team.managerId) !== String(managerId)) {
      throw new Error("Only the manager can view leave requests");
    }

    return await teamRepository.getLeaveRequests(teamId, status);
  };

  // 3️⃣ Manager approves leave
  const approveLeave = async (requestId, managerId) => {
    if (!requestId || !managerId) throw new Error("Request ID and Manager ID required");

    const request = await teamRepository.getLeaveRequestById(requestId);
    if (!request) throw new Error("Leave request not found");

    const team = await teamRepository.findById(request.teamId);
    if (!team) throw new Error("Team not found");

    if (String(team.managerId) !== String(managerId)) {
      throw new Error("Only the manager can approve leave");
    }

    return await teamRepository.approveLeave(requestId);
  };

  // 4️⃣ Manager rejects leave
  const rejectLeave = async (requestId, managerId) => {
    if (!requestId || !managerId) throw new Error("Request ID and Manager ID required");

    const request = await teamRepository.getLeaveRequestById(requestId);
    if (!request) throw new Error("Leave request not found");

    const team = await teamRepository.findById(request.teamId);
    if (!team) throw new Error("Team not found");

    if (String(team.managerId) !== String(managerId)) {
      throw new Error("Only the manager can reject leave");
    }

    return await teamRepository.rejectLeave(requestId);
  };

  return {
    createTeam,
    addMember,
    removeMember,
    getTeamById,
    getTeamsByManager,
    getTeamsByMember,
    getTeamByName,

    // Leave request system exposed
    requestLeave,
    getLeaveRequests,
    approveLeave,
    rejectLeave,
  };
};