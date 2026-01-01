// src/infrastructure/repository/user_repo.js
import { UserModel } from "../model/user_model.js";

export const userRepository = {
  // Create a new user
  async create(userEntity) {
    const userToCreate = { ...userEntity, role: userEntity.role || "user" }; // default role
    const user = await UserModel.create(userToCreate);
    const obj = user.toObject();
    return {
      id: obj._id.toString(),
      name: obj.name,
      username: obj.username,
      email: obj.email,
      password: obj.password,
      role: obj.role,
      profilePicture: obj.profilePicture || null,
      bio: obj.bio || "",
      experience: obj.experience || "",
      createdAt: obj.createdAt,
      refreshToken: obj.refreshToken || null,
    };
  },

  // Find user by username
  async findByUsername(username) {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      profilePicture: user.profilePicture || null,
      bio: user.bio || "",
      experience: user.experience || "",
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  // Find user by email
  async findByEmail(email) {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      profilePicture: user.profilePicture || null,
      bio: user.bio || "",
      experience: user.experience || "",
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  // Find user by ID
  async findById(id) {
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      profilePicture: user.profilePicture || null,
      bio: user.bio || "",
      experience: user.experience || "",
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  // Update user
  async update(id, updateData) {
    const updated = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      name: updated.name,
      username: updated.username,
      email: updated.email,
      password: updated.password,
      role: updated.role,
      profilePicture: updated.profilePicture || null,
      bio: updated.bio || "",
      experience: updated.experience || "",
      createdAt: updated.createdAt,
      refreshToken: updated.refreshToken || null,
    };
  },

  // Save refresh token
  async saveRefreshToken(id, refreshToken) {
    await UserModel.findByIdAndUpdate(id, { refreshToken });
  },

  // Find by refresh token
  async findByRefreshToken(refreshToken) {
    const user = await UserModel.findOne({ refreshToken }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      profilePicture: user.profilePicture || null,
      bio: user.bio || "",
      experience: user.experience || "",
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  // Revoke refresh token
  async revokeRefreshToken(id) {
    await UserModel.findByIdAndUpdate(id, { refreshToken: null });
  },

  // Update refresh token
  async updateRefreshToken(id, refreshToken) {
    const updated = await UserModel.findByIdAndUpdate(
      id,
      { refreshToken },
      { new: true } // return updated document
    ).lean();
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      name: updated.name,
      username: updated.username,
      email: updated.email,
      password: updated.password,
      role: updated.role,
      profilePicture: updated.profilePicture || null,
      bio: updated.bio || "",
      experience: updated.experience || "",
      createdAt: updated.createdAt,
      refreshToken: updated.refreshToken || null,
    };
  },
};
