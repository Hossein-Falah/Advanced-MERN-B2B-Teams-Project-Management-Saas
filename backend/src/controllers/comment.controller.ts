import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { uploadFileToS3 } from "../utils/s3";
import { HTTPSTATUS } from "../config/http.config";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { commentIdSchema, commentSchema } from "../validation/comment.validation";
import { Permissions } from "../enums/role.enum";
import { 
  createCommentService, 
  deleteCommentService, 
  getAllCommentService, 
  getCommentByIdService, 
  updateCommentService
} from "../services/comment.service";
import { taskIdSchema } from "../validation/task.validation";

export const createCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = commentSchema.parse(req.body);
    const taskId = projectIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_COMMENT]);

    let attachmentUrl: string | undefined;

    if (req.file) {
      attachmentUrl = await uploadFileToS3(req.file, "comment/attachment");
    }

    const { comment } = await createCommentService(
      workspaceId,
      taskId,
      userId,
      body,
      attachmentUrl
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment created successfully",
      comment,
    });
  }
);


export const deleteCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const commentId = commentIdSchema.parse(req.params.commentId)
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_COMMENT]);    

    await deleteCommentService(workspaceId, commentId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment deleted successfully",
    });
  }
);

export const updateCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = commentSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.taskId);
    const commentId = projectIdSchema.parse(req.params.commentId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_COMMENT]);

    const { updateComment } = await updateCommentService(
      workspaceId,
      commentId,
      taskId,
      body,
      req.file
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "comment updated successfully",
      comment: updateComment,
    });
  }
);

export const getAllCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const taskId = taskIdSchema.parse(req.params.taskId);

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const comments = await getAllCommentService(workspaceId, taskId, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "All comments fetched successfully",
      comments
    });
  }
);


export const getCommentByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const commentId = commentIdSchema.parse(req.params.commentId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const comment = await getCommentByIdService(workspaceId, commentId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Comment fetched successfully",
      comment,
    });
  }
);
