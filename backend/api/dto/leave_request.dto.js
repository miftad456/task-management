export const toLeaveRequestResponseDTO = (req) => {
  if (!req) return null;

  return {
    id: req.id,
    teamId: req.teamId,
    userId: req.userId,
    status: req.status,
    createdAt: req.createdAt,
  };
};
