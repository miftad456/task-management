export const registerUserUsecase = ({ userRepository, passwordService }) => {
  const registerUser = async (userData) => {
    const hashedPassword = await passwordService.hashPassword(userData.password);
    const user = await userRepository.create({ ...userData, password: hashedPassword });
    return user;
  };
  return { registerUser };
};

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
    });

    const refreshToken = await jwtService.generateRefreshToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    await userRepository.saveRefreshToken(user.id, refreshToken);

    const token = {
      accessToken,
      refreshToken,
    };
    return { user, token };
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
  // Accept the refresh token and handle verification, owner check, rotation
  const refreshToken = async (refreshTokenValue) => {
    if (!refreshTokenValue) throw new Error("Refresh token required");

    // 1) Find owner by refresh token
    const user = await userRepository.findByRefreshToken(refreshTokenValue);
    if (!user) throw new Error("Invalid refresh token");

    // 2) Verify refresh token signature/expiry
    let decoded;
    try {
      decoded = await jwtService.verifyRefreshToken(refreshTokenValue);
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }

    // 3) Ensure token belongs to user
    if (user.id !== decoded.userId) throw new Error("Invalid refresh token");

    // 4) Generate new tokens
    const accessToken = await jwtService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const newRefreshToken = await jwtService.generateRefreshToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // 5) Persist new refresh token
    await userRepository.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  };

  return { refreshToken };
};

// logout.usecase.js
export const logoutUsecase = ({ userRepository, jwtService }) => {
  const logout = async (refreshToken) => {
    // 1️⃣ Find user by refresh token
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) throw new Error("Invalid refresh token");

    // 2️⃣ Verify the refresh token
    const decoded = await jwtService.verifyRefreshToken(refreshToken);
    if (user.id !== decoded.userId) throw new Error("Invalid refresh token");

    // 3️⃣ Revoke refresh token in DB
    await userRepository.revokeRefreshToken(user.id);

    return true;
  };

  return { logout };
};