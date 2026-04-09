import { Request, Response } from "express";
import { uploadFileToS3 } from "../../utils/s3";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { CommentService } from "./comment.service";
import { commentIdSchema, commentSchema } from "./comment.validation";
import { projectIdSchema } from "../project/project.validation";
import { workspaceIdSchema } from "../workspace/workspace.validation";
import { Permissions } from "../../common/enums/role.enum";
import { roleGuard } from "../../utils/roleGuard";
import { taskIdSchema } from "../task/task.validation";
import { MemberService } from "../member/member.service";

export class CommentController {
  constructor(
    private commentService: CommentService,
    private memberService: MemberService
  ) { }

  createComment = async (req: Request, res: Response) => {
    const userId = req.user!._id;

    const body = commentSchema.parse(req.body);
    const taskId = projectIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_COMMENT]);

    let attachment;

    if (req.file) {
      attachment = await uploadFileToS3(req.file, "comment/attachment");
    }

    const comment = await this.commentService.createComment(
      workspaceId,
      taskId,
      userId,
      body,
      attachment
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.COMMENT.CREATED.code,
      message: MESSAGES.COMMENT.CREATED.message,
      data: comment,
    });
  };

  deleteComment = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const commentId = commentIdSchema.parse(req.params.commentId)
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_COMMENT]);

    await this.commentService.deleteComment(
      workspaceId,
      commentId,
      taskId
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.COMMENT.DELETED.code,
      message: MESSAGES.COMMENT.DELETED.message,
      data: null,
    });
  };

  updateComment = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = commentSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.taskId);
    const commentId = projectIdSchema.parse(req.params.commentId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_COMMENT]);

    const comment = await this.commentService.updateComment(
      workspaceId,
      commentId,
      taskId,
      body,
      req.file
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.COMMENT.UPDATED.code,
      message: MESSAGES.COMMENT.UPDATED.message,
      data: comment,
    });
  };

  getAllComments = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const pagination = {
      pageSize: Number(req.query.pageSize) || 10,
      pageNumber: Number(req.query.pageNumber) || 1,
    };

    const result = await this.commentService.getAllComments(
      workspaceId,
      taskId,
      pagination
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.COMMENT.FETCHED.code,
      message: MESSAGES.COMMENT.FETCHED.message,
      data: result,
    });
  };

  getCommentById = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const commentId = commentIdSchema.parse(req.params.commentId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const comment = await this.commentService.getCommentById(
      workspaceId,
      taskId,
      commentId
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.COMMENT.FETCHED.code,
      message: MESSAGES.COMMENT.FETCHED.message,
      data: comment,
    });
  };
}
