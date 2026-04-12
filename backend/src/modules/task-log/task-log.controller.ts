import { NextFunction, Request, Response } from "express";
import { TaskLogService } from "./task-log.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { buildPaginationMeta } from "../../utils/pagination-meta";
import { taskIdSchema } from "../../common/validator/common.validator";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";

export class TaskLogController {
    constructor(private taskLogService: TaskLogService) { }

    getTaskLogsController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
    
            const taskID = taskIdSchema.parse(taskId);

            const paginationQuery = paginationQuerySchema.parse(req.query);
            
            const { logs, pagination } = await this.taskLogService.getTaskLogs(paginationQuery, taskID);
    
            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.TASK_LOG.FETCHED.code,
                message: MESSAGES.TASK_LOG.FETCHED.message,
                data: { logs },
                meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.total),
            });
        } catch (error) {
            next(error);
        }
    };
}
