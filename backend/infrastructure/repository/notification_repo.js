import { NotificationModel } from "../model/notification_model.js";

export const notificationRepository = {
    create: async (notificationData) => {
        const notification = new NotificationModel(notificationData);
        return await notification.save();
    },

    findByRecipient: async (recipientId) => {
        return await NotificationModel.find({ recipientId })
            .populate("senderId", "username name profilePicture")
            .sort({ createdAt: -1 });
    },

    markAsRead: async (id) => {
        return await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    },

    markAllAsRead: async (recipientId) => {
        return await NotificationModel.updateMany({ recipientId, isRead: false }, { isRead: true });
    },

    delete: async (id) => {
        return await NotificationModel.findByIdAndDelete(id);
    },

    countUnread: async (recipientId) => {
        return await NotificationModel.countDocuments({ recipientId, isRead: false });
    }
};
