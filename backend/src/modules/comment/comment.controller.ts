import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { CommentService } from "./comment.service";
import { commentIdSchema, commentSchema } from "./comment.validation";
import { Permissions } from "../../common/enums/role.enum";
import { roleGuard } from "../../utils/roleGuard";
import { MemberService } from "../member/member.service";
import { projectIdSchema, taskIdSchema, workspaceIdSchema } from "../../common/validator/common.validator";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";
import { buildPaginationMeta } from "../../utils/pagination-meta";

export class CommentController {
  constructor(
    private commentService: CommentService,
    private memberService: MemberService
  ) { }

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!._id;

      const { taskId, workspaceId } = req.params;

      const taskID = projectIdSchema.parse(taskId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
      
      const body = commentSchema.parse(req.body);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.CREATE_COMMENT]);

      const files = req.files as Express.Multer.File[];
  
      const comment = await this.commentService.createComment(
        workspaceID,
        taskID,
        userId,
        body,
        files
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.COMMENT.CREATED.code,
        message: MESSAGES.COMMENT.CREATED.message,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const { taskId, commentId, workspaceId } = req.params;
  
      const taskID = taskIdSchema.parse(taskId);
      const commentID = commentIdSchema.parse(commentId)
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.DELETE_COMMENT]);
  
      const comment = await this.commentService.deleteComment(
        workspaceID,
        commentID,
        taskID
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.COMMENT.DELETED.code,
        message: MESSAGES.COMMENT.DELETED.message,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      const { taskId, commentId, workspaceId } = req.params;
      
      const taskID = taskIdSchema.parse(taskId);
      const commentID = projectIdSchema.parse(commentId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const body = commentSchema.parse(req.body);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.EDIT_COMMENT]);

      const files = req.files as Express.Multer.File[];
  
      const { comment } = await this.commentService.updateComment(
        userId,
        workspaceID,
        commentID,
        taskID,
        body,
        files
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.COMMENT.UPDATED.code,
        message: MESSAGES.COMMENT.UPDATED.message,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllComments = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;
  
      const { taskId, workspaceId } = req.params;

      const query = paginationQuerySchema.parse(req.query)

      const taskID = taskIdSchema.parse(taskId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.VIEW_ONLY]);

      const paginationFilter = {
        page: query.page,
        limit: query.limit,
      };
  
      const { comments, pagination } = await this.commentService.getAllComments(
        workspaceID,
        taskID,
        paginationFilter
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.COMMENT.FETCHED.code,
        message: MESSAGES.COMMENT.FETCHED.message,
        data: { comments },
        meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.totalCount),
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const { taskId, commentId, workspaceId } = req.params;

      const taskID = taskIdSchema.parse(taskId);
      const commentID = commentIdSchema.parse(commentId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const comment = await this.commentService.getCommentById(
        workspaceID,
        taskID,
        commentID
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.COMMENT.FETCHED.code,
        message: MESSAGES.COMMENT.FETCHED.message,
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  };
}
