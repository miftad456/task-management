import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "manager", "admin"], default: "user" }, // NEW
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", UserSchema);
