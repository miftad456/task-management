import 'dotenv/config';  // <-- this must be at the very top

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not set in environment variables");
}

export const jwtService = {
  generateToken: async (payload, options = { expiresIn: "15m" }) =>
    new Promise((resolve, reject) => {
      jwt.sign(payload, JWT_SECRET, options, (err, token) => (err ? reject(err) : resolve(token)));
    }),

  generateRefreshToken: async (payload, options = { expiresIn: "7d" }) =>
    new Promise((resolve, reject) => {
      jwt.sign(payload, JWT_REFRESH_SECRET, options, (err, token) => (err ? reject(err) : resolve(token)));
    }),

  verifyAccessToken: async (token) =>
    new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => (err ? reject(err) : resolve(decoded)));
    }),

  verifyRefreshToken: async (token) =>
    new Promise((resolve, reject) => {
      jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => (err ? reject(err) : resolve(decoded)));
    }),

  verifyToken: async (token) =>
    new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => (err ? reject(err) : resolve(decoded)));
    }),
};
