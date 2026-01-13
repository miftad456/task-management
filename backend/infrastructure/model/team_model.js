// src/infrastructure/model/team_model.js
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bio: { type: String, default: "" },
  profilePicture: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Compound unique index: a manager cannot have two teams with the same name
teamSchema.index({ managerId: 1, name: 1 }, { unique: true });

export const TeamModel = mongoose.model("Team", teamSchema);
