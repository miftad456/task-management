export const notificationUsecase = (notificationRepository) => {
    const getNotifications = async (userId) => {
        if (!userId) throw new Error("User ID is required");
        const notifications = await notificationRepository.findByRecipient(userId);
        const unreadCount = await notificationRepository.countUnread(userId);
        return { notifications, unreadCount };
    };

    const markAsRead = async (notificationId, userId) => {
        if (!notificationId) throw new Error("Notification ID is required");
        const notification = await notificationRepository.markAsRead(notificationId);
        return notification;
    };

    const markAllAsRead = async (userId) => {
        if (!userId) throw new Error("User ID is required");
        await notificationRepository.markAllAsRead(userId);
        return true;
    };

    const createNotification = async (data) => {
        return await notificationRepository.create(data);
    };

    return {
        getNotifications,
        markAsRead,
        markAllAsRead,
        createNotification,
    };
};
