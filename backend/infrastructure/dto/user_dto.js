export const toUserEntity = (model) => {
    if (!model) return null;

    return {
        id: model._id.toString(),
        name: model.name,
        username: model.username,
        email: model.email,
        password: model.password,
        createdAt: model.createdAt,
        refreshToken: model.refreshToken || null,
    };
};
