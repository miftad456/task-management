import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    deadline: { type: Date, default: null },
    timeSpent: { type: Number, default: 0 },
    userId: { type: String, required: true },
}, { timestamps: true });

export const TaskModel = mongoose.model("Task", TaskSchema);
