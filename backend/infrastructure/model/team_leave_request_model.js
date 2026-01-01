import mongoose from "mongoose";

const TeamLeaveRequestSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

// index to speed up team + status queries
TeamLeaveRequestSchema.index({ teamId: 1, status: 1 });

export const TeamLeaveRequestModel = mongoose.model(
  "TeamLeaveRequest",
  TeamLeaveRequestSchema
);