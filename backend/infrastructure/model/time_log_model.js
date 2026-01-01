import mongoose from "mongoose";

const TimeLogSchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        duration: {
            type: Number, // duration in minutes
            required: true,
            min: 1,
        },
        note: {
            type: String,
            default: "",
        },
        startTime: {
            type: Date,
            default: null,
        },
        endTime: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for faster lookups
TimeLogSchema.index({ taskId: 1 });
TimeLogSchema.index({ userId: 1 });

export const TimeLogModel = mongoose.model("TimeLog", TimeLogSchema);
