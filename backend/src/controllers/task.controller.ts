import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "../validation/task.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  redoTask,
  undoTask,
  updateTaskService,
} from "../services/task.service";
import { HTTPSTATUS } from "../config/http.config";
import { uploadFileToS3 } from "../utils/s3";
import { toObjectId } from "../utils/convert-objectId.util";

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    let attachmentUrl: string | undefined;
    if (req.file) {
      attachmentUrl = await uploadFileToS3(req.file, "task/attachment");
    }

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      body,
      attachmentUrl
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task created successfully",
      task,
    });
  }
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = updateTaskSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await updateTaskService(
      workspaceId,
      projectId,
      taskId,
      userId,
      body,
      req.file
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  }
);

export const getAllTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(",")
        : undefined,
      priority: req.query.priority
        ? (req.query.priority as string)?.split(",")
        : undefined,
      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(",")
        : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTasksService(workspaceId, filters, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "All tasks fetched successfully",
      ...result,
    });
  }
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const task = await getTaskByIdService(workspaceId, projectId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task fetched successfully",
      task,
    });
  }
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);    
    roleGuard(role, [Permissions.DELETE_TASK]);

    await deleteTaskService(workspaceId, taskId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task deleted successfully",
    });
  }
);

export const undoTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;

      const taskId = taskIdSchema.parse(req.params.taskId);
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
      const logId = taskIdSchema.parse(req.params.logId);
  
      const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.UNDO_TASK]);

      const result = await undoTask(toObjectId(taskId), toObjectId(logId));

      return res.status(HTTPSTATUS.OK).json({
        message: "Undo Task successfully",
        result
      })
    } catch (error: any) {            
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: error.message
      });
    }
  }
)

export const redoTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;

      const taskId = taskIdSchema.parse(req.params.taskId);
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
      const logId = taskIdSchema.parse(req.params.logId);

      const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.REDO_TASK]);

      const result = await redoTask(toObjectId(taskId), toObjectId(logId));

      return res.status(HTTPSTATUS.OK).json({
        message: "Redo Task Successfully",
        result
      })
    } catch (error: any) {    
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: error.message
      });
    }
  }
)
