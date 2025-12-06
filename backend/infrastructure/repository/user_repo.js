import { UserModel } from "../model/user_model.js";

export const userRepository = {
  async create(userEntity) {
    const user = await UserModel.create(userEntity);
    const obj = user.toObject();
    return {
      id: obj._id.toString(),
      name: obj.name,
      username: obj.username,
      email: obj.email,
      password: obj.password,
      createdAt: obj.createdAt,
      refreshToken: obj.refreshToken || null,
    };
  },

  async findByUsername(username) {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  async findByEmail(email) {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  async findById(id) {
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  async update(id, updateData) {
    const updated = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      name: updated.name,
      username: updated.username,
      email: updated.email,
      password: updated.password,
      createdAt: updated.createdAt,
      refreshToken: updated.refreshToken || null,
    };
  },

  async saveRefreshToken(id, refreshToken) {
    await UserModel.findByIdAndUpdate(id, { refreshToken });
  },

  async findByRefreshToken(refreshToken) {
    const user = await UserModel.findOne({ refreshToken }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      refreshToken: user.refreshToken || null,
    };
  },

  async revokeRefreshToken(id) {
    await UserModel.findByIdAndUpdate(id, { refreshToken: null });
  },

  // ✅ Added method
  async updateRefreshToken(id, refreshToken) {
    const updated = await UserModel.findByIdAndUpdate(
      id,
      { refreshToken },
      { new: true } // return updated document if needed
    ).lean();
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      name: updated.name,
      username: updated.username,
      email: updated.email,
      password: updated.password,
      createdAt: updated.createdAt,
      refreshToken: updated.refreshToken || null,
    };
  },
};
