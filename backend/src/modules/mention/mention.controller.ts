import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { MentionService } from "./mention.service";
import { HTTPSTATUS } from "../../config/http.config";
import { workspaceIdSchema } from "../../validation/workspace.validation";

export const mentionUsersController = asyncHandler(
    async (req: Request, res: Response) => {
        const { query } = req.query; // user search query

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const mention = await MentionService.getMentionUsers(workspaceId, query as string, page, limit);

        return res.status(HTTPSTATUS.OK).json({
            message: "get user successfully",
            mention
        });
    }
);
