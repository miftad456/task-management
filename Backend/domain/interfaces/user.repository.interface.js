export class IUserRepository {
    async create(user) { throw new Error("Not implemented"); }
    async findByUsername(username) { throw new Error("Not implemented"); }
    async findByEmail(email) { throw new Error("Not implemented"); }
    async findById(id) { throw new Error("Not implemented"); }
    async update(id, user) { throw new Error("Not implemented"); }

    // New abstract methods for refresh tokens
    async saveRefreshToken(userId, refreshToken) { throw new Error("Not implemented"); }
    async findByRefreshToken(refreshToken) { throw new Error("Not implemented"); }
    async revokeRefreshToken(userId) { throw new Error("Not implemented"); }
}
