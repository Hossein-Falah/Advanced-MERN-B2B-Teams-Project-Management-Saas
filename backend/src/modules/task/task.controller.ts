import { Request, Response } from "express";
import { TaskService } from "./task.service";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "./task.validation";
import { projectIdSchema } from "../project/project.validation";
import { workspaceIdSchema } from "../workspace/workspace.validation";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { uploadFileToS3 } from "../../utils/s3";
import { MemberService } from "../member/member.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { parseTaskFilters } from "../../utils/parse-filter.util";
import { toObjectId } from "../../utils/convert-objectId.util";

export class TaskController {
  constructor(
    private taskService: TaskService,
    private memberService: MemberService
  ) { }

  createTask = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    let attachmentUrl: string | undefined;
    if (req.file) {
      attachmentUrl = await uploadFileToS3(req.file, "task/attachment");
    }

    const { task } = await this.taskService.createTask(
      workspaceId,
      projectId,
      userId,
      body,
      attachmentUrl
    );

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.CREATED.code,
      message: MESSAGES.TASK.CREATED.message,
      data: task,
    });
  }

  updateTask = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = updateTaskSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await this.taskService.updateTask(
      workspaceId,
      projectId,
      taskId,
      userId,
      body,
      req.file
    );

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.UPDATED.code,
      message: MESSAGES.TASK.UPDATED.message,
      data: updatedTask,
    });
  };

  getAllTasks = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const filters = parseTaskFilters(req.query);

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await this.taskService.getAllTasks(workspaceId, filters, pagination);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.ALL_FETCHED.code,
      message: MESSAGES.TASK.ALL_FETCHED.message,
      data: result,
    });
  };

  getTaskById = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const task = await this.taskService.getTaskById(workspaceId, projectId, taskId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.FETCHED.code,
      message: MESSAGES.TASK.FETCHED.message,
      data: task,
    });
  };

  deleteTask = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.query.taskId);
    const workspaceId = workspaceIdSchema.parse(req.query.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_TASK]);

    await this.taskService.deleteTask(workspaceId, taskId, userId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.DELETED.code,
      message: MESSAGES.TASK.DELETED.message,
      data: null,
    });
  };

  undoTask = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const logId = taskIdSchema.parse(req.params.logId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.UNDO_TASK]);

    const result = await this.taskService.undoTask(toObjectId(taskId), toObjectId(logId));

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.UNDO.code,
      message: MESSAGES.TASK.UNDO.message,
      data: result,
    });
  };

  redoTask = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const logId = taskIdSchema.parse(req.params.logId);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.REDO_TASK]);

    const result = await this.taskService.redoTask(toObjectId(taskId), toObjectId(logId));

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.TASK.REDO.code,
      message: MESSAGES.TASK.REDO.message,
      data: result,
    });
  };
}
