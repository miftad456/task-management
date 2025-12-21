// backend/api/dto/team.dto.js
export const toTeamResponseDTO = (team, requesterId) => {
  if (!team) return null;

  const isManager = String(team.managerId) === String(requesterId);
  const isMember = (team.members || []).some(m => String(m) === String(requesterId));

  const base = {
    name: team.name,
    createdAt: team.createdAt,
  };

  // Manager sees everything including id and managerId
  if (isManager) {
    return {
      id: team.id,
      name: team.name,
      managerId: team.managerId,
      members: team.members,
      createdAt: team.createdAt,
    };
  }

  // Member sees members and other info but not the id or managerId
  if (isMember) {
    return {
      name: team.name,
      members: team.members,
      createdAt: team.createdAt,
    };
  }

  // Non-member sees only minimal public fields (no id, no members)
  return {
    name: team.name,
    createdAt: team.createdAt,
  };
};