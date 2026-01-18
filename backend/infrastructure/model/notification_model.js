import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", refPath: "senderModel" },
        senderModel: { type: String, enum: ["User", "Team"], default: "User" },
        type: {
            type: String,
            enum: ["task_assigned", "leave_request", "urgent_task", "comment_added", "task_approved", "task_rejected"],
            required: true
        },
        message: { type: String, required: true },
        link: { type: String },
        isRead: { type: Boolean, default: false },
        isUrgent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const NotificationModel = mongoose.model("Notification", notificationSchema);
