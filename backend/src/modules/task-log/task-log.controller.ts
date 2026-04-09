import { Request, Response } from "express";
import { taskIdSchema } from "../task/task.validation";
import { TaskLogService } from "./task-log.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { buildPaginationMeta } from "../../utils/pagination-meta";

export class TaskLogController {
    constructor(private taskLogService: TaskLogService) { }

    getTaskLogsController = async (req: Request, res: Response) => {
        const taskId = taskIdSchema.parse(req.params.taskId);


        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const { logs, pagination } = await this.taskLogService.getTaskLogs(taskId, page, limit);

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.TASK_LOG.FETCHED.code,
            message: MESSAGES.TASK_LOG.FETCHED.message,
            data: logs,
            meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.total),
        });
    };
}
