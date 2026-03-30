import NotificationModel, { NotificationDocument } from "./notification.model";
import { io } from "../../socket";

export class NotificationService {
    static async create(data: Partial<NotificationDocument>) {
        let notification = await NotificationModel.create(data);

        notification = await notification.populate([
            { path: "sender", select: "id name email username profilePicture -password" },
            { path: "task", select: "_id title description" }
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

        return notification;
    }

    static async getAllNotifications(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const notifications = await NotificationModel
            .find({ receiver: userId }, { receiver: 0 })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "sender", select: "id name email username profilePicture -password" })
            .populate({ path: "task", select: "_id title description" })

        const unreadCount = await NotificationModel.countDocuments({
            receiver: userId,
            read: false
        });

        const total = await NotificationModel.countDocuments({ receiver: userId });

        return {
            notifications,
            unreadCount,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    static async markAllAsRead(userId: string) {
        await NotificationModel.updateMany(
            { receiver: userId, read: false },
            { read: true }
        );
    }
}
