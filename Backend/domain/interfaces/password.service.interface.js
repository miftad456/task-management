export class IPasswordService {
    async hash(password) { throw new Error("Not implemented"); }
    async compare(password, hashedPassword) { throw new Error("Not implemented"); }
}
