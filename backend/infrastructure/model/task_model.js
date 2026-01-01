import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    deadline: { type: Date, default: null },
    timeSpent: { type: Number, default: 0 },
    userId: { type: String, required: false },
    urgentBeforeMinutes: { type: Number, default: null },
    attachments: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        url: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model("Task", TaskSchema);
