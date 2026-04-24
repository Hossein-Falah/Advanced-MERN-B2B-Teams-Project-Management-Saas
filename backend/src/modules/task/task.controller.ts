import { NextFunction, Request, Response } from "express";
import { TaskService } from "./task.service";
import { createTaskSchema, taskCloneQuerySchema, taskQuerySchema, updateTaskSchema } from "./task.validation";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { MemberService } from "../member/member.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { toObjectId } from "../../utils/convert-objectId.util";
import { buildPaginationMeta } from "../../utils/pagination-meta";
import { 
  logIdSchema, 
  projectIdSchema, 
  taskIdSchema, 
  workspaceIdSchema
 } from "../../common/validator/common.validator";

export class TaskController {
  constructor(
    private taskService: TaskService,
    private memberService: MemberService
  ) { }

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const { projectId, workspaceId } = req.params;

      const body = createTaskSchema.parse(req.body);
      const projectID = projectIdSchema.parse(projectId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);

      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.CREATE_TASK]);

      const files = req.files as Express.Multer.File[];

      const task = await this.taskService.createTask(
        workspaceID,
        projectID,
        userId,
        body,
        files
      );

      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.CREATED.code,
        message: MESSAGES.TASK.CREATED.message,
        data: task,
      });
    } catch (error) {      
      next(error);
    }
  }

  cloneTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const { taskId, workspaceId } = taskCloneQuerySchema.parse(req.query);

      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.CLONE_TASK]);      

      const task = await this.taskService.cloneTask({ taskId, userId });

      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.CLONE.code,
        message: MESSAGES.TASK.CLONE.message,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const { id, projectId, workspaceId } = req.params;

      const body = updateTaskSchema.parse(req.body);

      const taskId = taskIdSchema.parse(id);
      const projectID = projectIdSchema.parse(projectId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);

      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.EDIT_TASK]);

      const files = req.files as Express.Multer.File[];

      const task = await this.taskService.updateTask(
        workspaceID,
        projectID,
        taskId,
        userId,
        body,
        files
      );

      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.UPDATED.code,
        message: MESSAGES.TASK.UPDATED.message,
        data: task,
      });
    } catch (error) {
      next(error)
    }
  };

  getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
      const query = taskQuerySchema.parse(req.query);

      const filters = {
        projectId: query.projectId,
        status: query.status,
        priority: query.priority,
        assignedTo: query.assignedTo,
        taskId: query.taskId,
        keyword: query.keyword,
        dueDate: query.dueDate,
      };

      const paginationFilter = {
        page: query.page,
        limit: query.limit,
      };

      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.VIEW_ONLY]);

      const { tasks, pagination } = await this.taskService.getAllTasks(workspaceId, filters, paginationFilter);

      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.ALL_FETCHED.code,
        message: MESSAGES.TASK.ALL_FETCHED.message,
        data: { tasks },
        meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.totalCount)
      });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      const { id, projectId, workspaceId } = req.params;

      const taskId = taskIdSchema.parse(id);
      const projectID = projectIdSchema.parse(projectId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const task = await this.taskService.getTaskById(workspaceID, projectID, taskId);
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.FETCHED.code,
        message: MESSAGES.TASK.FETCHED.message,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;

      const { taskId, workspaceId } = req.query;
  
      const taskID = taskIdSchema.parse(taskId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.DELETE_TASK]);
  
      const task = await this.taskService.deleteTask(workspaceID, taskID, userId);
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.DELETED.code,
        message: MESSAGES.TASK.DELETED.message,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  undoTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      const { taskId, workspaceId, logId } = req.params;

      const taskID = taskIdSchema.parse(taskId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
      const logID = taskIdSchema.parse(logId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.UNDO_TASK]);
  
      const task = await this.taskService.undoTask(toObjectId(taskID), toObjectId(logID));
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.UNDO.code,
        message: MESSAGES.TASK.UNDO.message,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  redoTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const { logId, taskId, workspaceId } = req.params;
  
      const logID = logIdSchema.parse(logId);
      const taskID = taskIdSchema.parse(taskId);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.REDO_TASK]);
  
      const task = await this.taskService.redoTask(toObjectId(taskID), toObjectId(logID));
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.TASK.REDO.code,
        message: MESSAGES.TASK.REDO.message,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };
}
