import jwt from "jsonwebtoken";

export const jwtService = {
    generateAccessToken: async (payload) => {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
    },

    generateRefreshToken: async (payload) => {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });
    },

    verifyAccessToken: async (token) => {
        return jwt.verify(token, process.env.JWT_SECRET);
    },

    verifyRefreshToken: async (token) => {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
};
