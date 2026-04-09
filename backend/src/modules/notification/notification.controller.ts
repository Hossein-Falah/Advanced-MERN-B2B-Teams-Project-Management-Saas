import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { notificationIdSchema } from "./notification.validation";

export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    getAllNotificationController = async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const notifications = await this.notificationService.getAllNotifications(
            userId,
            page,
            limit
        );

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.NOTIFICATION.FETCHED.code,
            message: MESSAGES.NOTIFICATION.FETCHED.message,
            data: notifications
        });
    };

    readNotificationController = async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const notificationId = notificationIdSchema.parse(
            req.params.notificationId
        );

        const notification = await this.notificationService.markAsRead(
            notificationId,
            userId
        );

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.NOTIFICATION.READ.code,
            message: MESSAGES.NOTIFICATION.READ.message,
            data: notification,
        });
    };

    readAllNotificationController = async (req: Request, res: Response) => {
        const userId = req.user?._id;

        await this.notificationService.markAllAsRead(userId);

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.NOTIFICATION.READ_ALL.code,
            message: MESSAGES.NOTIFICATION.READ_ALL.message,
            data: null,
        });
    };
}
