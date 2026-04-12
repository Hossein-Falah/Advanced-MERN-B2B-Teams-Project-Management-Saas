import { NextFunction, Request, Response } from "express";
import { MentionService } from "./mention.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { workspaceIdSchema } from "../../common/validator/common.validator";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";
import { buildPaginationMeta } from "../../utils/pagination-meta";

export class MentionController {
    constructor(private mentionService: MentionService) {}
  
    mentionUsers = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const query = req.query.query as string;

        const { workspaceId } = req.params;

        const { page, limit } = paginationQuerySchema.parse(req.query)
    
        const workspaceID = workspaceIdSchema.parse(workspaceId);
    
        const paginationFilter = { page, limit };
    
        const { users, pagination } = await this.mentionService.getMentionUsers(
          paginationFilter,
          workspaceID,
          query
        );
    
        return ResponseHandler.send(res, {
          statusCode: HTTPSTATUS.OK,
          code: MESSAGES.USER.MENTION_FETCHED.code,
          message: MESSAGES.USER.MENTION_FETCHED.message,
          data: { users },
          meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.total)
        });
      } catch (error) {
        next(error);
      }
    };
  }
  