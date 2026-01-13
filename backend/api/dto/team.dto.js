export const toTeamResponseDTO = (team, requesterId) => {
  if (!team) return null;

  // Normalize managerId and check permissions
  const managerId = team.managerId?.id || team.managerId;
  const isManager = String(managerId) === String(requesterId);

  const isMember = (team.members || []).some(m => {
    const memberId = m?.id || m;
    return String(memberId) === String(requesterId);
  });

  // These are the new fields that were missing from your previous DTO
  const profileData = {
    bio: team.bio || "",
    profilePicture: team.profilePicture || null,
  };

  // Manager and Members get the full data set
  if (isManager || isMember) {
    return {
      id: team.id,
      name: team.name,
      managerId: team.managerId,
      members: team.members,
      createdAt: team.createdAt,
      ...profileData // Injects bio and profilePicture
    };
  }

  // Non-members (Public View)
  return {
    name: team.name,
    createdAt: team.createdAt,
    ...profileData // Injects bio and profilePicture
  };
};