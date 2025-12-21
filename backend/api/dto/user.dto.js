export const toUserResponseDTO = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name,
  role: user.role, // NEW
  createdAt: user.createdAt,
});
