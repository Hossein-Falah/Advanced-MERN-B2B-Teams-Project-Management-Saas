import { Request, Response } from "express";
import { MentionService } from "./mention.service";
import { workspaceIdSchema } from "../workspace/workspace.validation";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";

export class MentionController {
    constructor(private mentionService: MentionService) {}
  
    mentionUsers = async (req: Request, res: Response) => {
      const query = req.query.query as string;
  
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
  
      const mention = await this.mentionService.getMentionUsers(
        workspaceId,
        query,
        page,
        limit
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.USER.MENTION_FETCHED.code,
        message: MESSAGES.USER.MENTION_FETCHED.message,
        data: mention,
      });
    };
  }
  