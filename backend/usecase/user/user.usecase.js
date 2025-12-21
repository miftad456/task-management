export const registerUserUsecase = ({ userRepository, passwordService }) => {
  const registerUser = async (userData) => {
    const hashedPassword = await passwordService.hashPassword(userData.password);
    // Default role is "user"
    const user = await userRepository.create({ ...userData, password: hashedPassword, role: "user" });
    return user;
  };
  return { registerUser };
};

// src/usecase/user/user.usecase.js
export const loginUserUsecase = ({ userRepository, passwordService, jwtService }) => {
  const loginUser = async (username, password) => {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new Error("User not found");

    const isValid = await passwordService.comparePassword(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const accessToken = await jwtService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // ✅ include role
    });

    const refreshToken = await jwtService.generateRefreshToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // ✅ include role
    });

    await userRepository.saveRefreshToken(user.id, refreshToken);

    return { user, token: { accessToken, refreshToken } };
  };
  return { loginUser };
};


export const getUserUsecase = ({ userRepository }) => {
  const getUser = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  };
  return { getUser };
};

export const updateUserUsecase = ({ userRepository }) => {
  const updateUser = async (userId, updates) => {
    const updatedUser = await userRepository.update(userId, updates);
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  };
  return { updateUser };
};

export const refreshTokenUsecase = ({ userRepository, jwtService }) => {
  const refreshToken = async (refreshTokenValue) => {
    if (!refreshTokenValue) throw new Error("Refresh token required");

    const user = await userRepository.findByRefreshToken(refreshTokenValue);
    if (!user) throw new Error("Invalid refresh token");

    let decoded;
    try {
      decoded = await jwtService.verifyRefreshToken(refreshTokenValue);
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }

    if (user.id !== decoded.userId) throw new Error("Invalid refresh token");

    const accessToken = await jwtService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await jwtService.generateRefreshToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    await userRepository.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  };

  return { refreshToken };
};

export const logoutUsecase = ({ userRepository, jwtService }) => {
  const logout = async (refreshToken) => {
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) throw new Error("Invalid refresh token");

    const decoded = await jwtService.verifyRefreshToken(refreshToken);
    if (user.id !== decoded.userId) throw new Error("Invalid refresh token");

    await userRepository.revokeRefreshToken(user.id);

    return true;
  };

  return { logout };
};
