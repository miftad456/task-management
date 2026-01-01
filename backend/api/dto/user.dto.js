export const toUserResponseDTO = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name,
  role: user.role,
  profilePicture: user.profilePicture || null,
  bio: user.bio || "",
  experience: user.experience || "",
  createdAt: user.createdAt,
});
