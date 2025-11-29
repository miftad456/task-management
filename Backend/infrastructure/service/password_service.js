import bcrypt from "bcrypt";

export const passwordService = {
    hash: async (password) => {
        return bcrypt.hash(password, 10);
    },

    compare: async (password, hashed) => {
        return bcrypt.compare(password, hashed);
    }
};
