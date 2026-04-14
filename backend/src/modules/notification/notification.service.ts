import { Model } from "mongoose";

import { io } from "../../socket";
import { NotificationDocument } from "./notification.model";
import { PaginationFilter } from "../../common/types/pagination.type";

export class NotificationService {
    constructor(
        private notificationModel: Model<NotificationDocument>,
    ) {}

    public async create(data: Partial<NotificationDocument>) {
        let notification = await this.notificationModel.create(data);        

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
                workspace: notification.workspace,
                read: notification.read,
                createdAt: notification.createdAt
            });
        }

        return notification;
    }

    public async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findOneAndUpdate(
            { _id: notificationId, receiver: userId },
            { read: true },
            { new: true }
        );

        return notification;
    }

    public async getAllNotifications({ page, limit }: PaginationFilter, userId: string) {
        const skip = (page - 1) * limit;

        const notifications = await this.notificationModel
            .find({ receiver: userId }, { receiver: 0 })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "sender", select: "id name email username profilePicture -password" })
            .populate({ path: "task", select: "_id title description" })

        const unreadCount = await this.notificationModel.countDocuments({
            receiver: userId,
            read: false
        });

        const total = await this.notificationModel.countDocuments({ receiver: userId });

        return {
            notifications,
            unreadCount,
            pagination: {
                total,
                page,
                limit
            },
        };
    }

    public async markAllAsRead(userId: string) {
        await this.notificationModel.updateMany(
            { receiver: userId, read: false },
            { read: true }
        );
    }
}
