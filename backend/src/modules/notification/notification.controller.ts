import { NextFunction, Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";
import { buildPaginationMeta } from "../../utils/pagination-meta";
import { notificationIdSchema } from "../../common/validator/common.validator";

export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    getAllNotificationController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const paginationFilter = paginationQuerySchema.parse(req.query);
    
            const { notifications, unreadCount, pagination } = await this.notificationService.getAllNotifications(paginationFilter, userId);
    
            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.NOTIFICATION.FETCHED.code,
                message: MESSAGES.NOTIFICATION.FETCHED.message,
                data: { notifications, unreadCount },
                meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.total)
            });
        } catch (error) {
            next(error);
        }
    };

    readNotificationController = async (req: Request, res: Response, next: NextFunction) => {
        try {            
            const userId = req.user?._id;
    
            const notificationId = notificationIdSchema.parse(req.params.notificationId);
    
            const notification = await this.notificationService.markAsRead(
                notificationId,
                userId
            );
    
            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.NOTIFICATION.READ.code,
                message: MESSAGES.NOTIFICATION.READ.message,
                data: { notification },
            });
        } catch (error) {
            next(error);
        }
    };

    readAllNotificationController = async (req: Request, res: Response, next: NextFunction) => {
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
