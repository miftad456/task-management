export const updateTeamProfileUsecase = ({ teamRepository }) => {
    const execute = async (teamId, managerId, profileData) => {
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("We cannot find this team");

        const teamManagerId = team.managerId?.id || team.managerId;
        if (String(teamManagerId) !== String(managerId)) {
            throw new Error("Only team manager can update team profile");
        }

        const { name, bio, profilePicture } = profileData;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

        return await teamRepository.update(teamId, updateData);
    };
    return { execute };
};

export const getTeamProfileUsecase = ({ teamRepository }) => {
    const execute = async (teamId) => {
        const team = await teamRepository.findById(teamId);
        if (!team) throw new Error("We cannot find this team");
        return team; // Return the whole entity, the DTO will filter it later
    };
    return { execute };
};