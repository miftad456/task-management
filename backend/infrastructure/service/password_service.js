import bcrypt from "bcrypt";

export const passwordService = {
  hashPassword: async (password) => {
    return bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hashed) => {
    return bcrypt.compare(password, hashed);
  },
};
