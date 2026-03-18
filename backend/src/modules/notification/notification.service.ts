import NotificationModel, { NotificationDocument } from "./notification.model";
import { io } from "../../socket";

export class NotificationService {
    static async create(data: Partial<NotificationDocument>) {        
        let notification = await NotificationModel.create(data);
        
        notification = await notification.populate([
            { path: "sender", select: "id name email -password" },
            { path: "task", select: "_id title" }
        ]);

        if (io) {
            io.to(`user:${data.receiver}`).emit("notification:new", {
                _id: notification._id,
                type: notification.type,
                sender: notification.sender,
                task: notification.task,
                comment: notification.comment,
                createdAt: notification.createdAt
            });
        }

        return notification;
    }

    static async markAsRead(notificationId: string, userId: string) {
        const notification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, receiver: userId },
            { read: true },
            { new: true }
        );

        if (!notification) return null;

        if (io) {
            io.to(`user:${userId}`).emit("notification:read", {
                notificationId: notification._id
            });
        }

        return notification;
    }

    static async markAllAsRead(userId: string) {
        await NotificationModel.updateMany(
            { receiver: userId, read: false },
            { read: true }
        );

        if (io) {
            io.to(`user:${userId}`).emit("notification:all-read");
        }
    }

    static async getUserNotifications(userId: string) {
        const notifications = await NotificationModel
            .find({ receiver: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await NotificationModel.countDocuments({
            receiver: userId,
            read: false
        });

        return {
            notifications,
            unreadCount
        };
    }
}
