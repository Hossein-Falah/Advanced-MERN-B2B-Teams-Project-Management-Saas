import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getTaskLogsService } from "../services/task-log.service";
import { HTTPSTATUS } from "../config/http.config";

export const getTaskLogsController = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params;
        
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
        
            const result = await getTaskLogsService(taskId, page, limit);
        
            return res.status(HTTPSTATUS.OK).json(result);
            
        } catch (error: any) {
            return res.status(500).json({
              message: error.message,
            })
        }
    }
);
  