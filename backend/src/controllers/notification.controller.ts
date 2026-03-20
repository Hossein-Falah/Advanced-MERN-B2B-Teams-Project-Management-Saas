import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { NotificationService } from "../modules/notification/notification.service";
import { notificationIdSchema } from "../validation/notification.validation";

export const getAllNotificationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;
        
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const notifications = await NotificationService.getAllNotifications(userId, page, limit);

        return res.status(200).json({
            message: "get all notification successfully",
            notifications
        });
    }
)

export const readNotificationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const notificationId = notificationIdSchema.parse(req.params.notificationId);

        const notification = await NotificationService.markAsRead(
            notificationId,
            userId
        );

        return res.status(200).json({
            message: "read notification successfully",
            notification,
        });
    }
)

export const readAllNotificationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        await NotificationService.markAllAsRead(userId);

        return res.status(200).json({
            message: "All notifications marked as read",
        });
    }
)
