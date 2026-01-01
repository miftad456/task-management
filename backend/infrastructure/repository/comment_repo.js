import { CommentModel } from "../model/comment_model.js";
import { Comment } from "../../domain/entities/comment.entity.js";

const map = (doc) => {
    if (!doc) return null;
    return new Comment({
        id: doc._id.toString(),
        content: doc.content,
        taskId: doc.taskId.toString(),
        userId: doc.userId.toString(),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    });
};

// Map with user info for DTO (when populated)
const mapWithUser = (doc) => {
    if (!doc) return null;
    
    // Handle populated user info
    let userInfo = null;
    if (doc.userId && typeof doc.userId === 'object' && doc.userId._id) {
        // Populated user object
        userInfo = {
            id: doc.userId._id.toString(),
            username: doc.userId.username,
            name: doc.userId.name
        };
    } else if (doc.user && typeof doc.user === 'object') {
        // Already mapped user info
        userInfo = doc.user;
    }
    
    const result = {
        id: doc._id.toString(),
        content: doc.content,
        taskId: doc.taskId.toString(),
        userId: userInfo ? userInfo.id : doc.userId.toString(),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
    
    if (userInfo) {
        result.user = userInfo;
    }
    
    return result;
};

export const commentRepository = {
    async create(commentEntity) {
        const doc = await CommentModel.create({
            content: commentEntity.content,
            taskId: commentEntity.taskId,
            userId: commentEntity.userId,
        });
        return map(doc);
    },

    async findByTaskId(taskId) {
        const docs = await CommentModel.find({ taskId })
            .populate('userId', 'username name')
            .sort({ createdAt: -1 })
            .lean();
        return docs.map(mapWithUser);
    },

    async findById(id) {
        const doc = await CommentModel.findById(id)
            .populate('userId', 'username name')
            .lean();
        return mapWithUser(doc);
    },

    async update(id, updateData) {
        const doc = await CommentModel.findByIdAndUpdate(
            id,
            { content: updateData.content, updatedAt: new Date() },
            { new: true }
        )
        .populate('userId', 'username name')
        .lean();
        if (!doc) return null;
        return mapWithUser(doc);
    },

    async delete(id) {
        await CommentModel.findByIdAndDelete(id);
    },

    async countByTaskId(taskId) {
        return await CommentModel.countDocuments({ taskId });
    },
};
