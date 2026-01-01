import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
