export const updateProfileUsecase = (userRepository) => {
    const execute = async (userId, profileData) => {
        const { name, bio, experience, profilePicture } = profileData;

        // Only update allowed fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (experience !== undefined) updateData.experience = experience;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

        const updatedUser = await userRepository.update(userId, updateData);
        if (!updatedUser) throw new Error("User not found");

        return updatedUser;
    };

    return { execute };
};

export const getProfileUsecase = (userRepository) => {
    const execute = async (identifier) => {
        let user;

        // Try finding by ID first if it looks like a valid ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            user = await userRepository.findById(identifier);
        }

        // If not found by ID, try finding by username
        if (!user) {
            user = await userRepository.findByUsername(identifier);
        }

        if (!user) throw new Error("User not found");

        // Return profile-related info (excluding sensitive data like password)
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            bio: user.bio,
            experience: user.experience,
            createdAt: user.createdAt,
        };
    };

    return { execute };
};
