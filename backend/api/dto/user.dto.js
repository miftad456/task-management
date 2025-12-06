export const toUserResponseDTO = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});
