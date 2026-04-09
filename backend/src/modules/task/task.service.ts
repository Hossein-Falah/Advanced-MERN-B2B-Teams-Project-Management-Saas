import { Model, Types } from "mongoose";
import { CreateTaskInput, TaskPagination, UpdateTaskInput } from "./interface/task.interface";
import { ProjectDocument } from "../project/project.model";
import { MemberDocument } from "../member/member.model";
import { TaskDocument } from "./task.model";
import { TaskLogDocument } from "../task-log/task-log.model";
import { MESSAGES } from "../../common/constants/message.constant";
import { BadRequestException, NotFoundException } from "../../common/errors/app-error";
import { validateTaskDates } from "../../utils/validate-task.util";
import { TaskPriorityEnum, TaskStatusEnum } from "../../common/enums/task.enum";
import { TaskLogActionEnumType } from "../../common/enums/task-log.enum";
import { deleteFile, uploadFileToS3 } from "../../utils/s3";
import { TaskFilters } from "../../@types/task.type";
import { toObjectId } from "../../utils/convert-objectId.util";
import { NotificationType, NotificationTypeEnum } from "../../common/enums/notification.enum";
import { NotificationService } from "../notification/notification.service";
import { TaskLogService } from "../task-log/task-log.service";

export class TaskService {
  constructor(
    private projectModel: Model<ProjectDocument>,
    private memberModel: Model<MemberDocument>,
    private taskModel: Model<TaskDocument>,
    private taskLogModel: Model<TaskLogDocument>,
    private notificationService: NotificationService,
    private taskLogService: TaskLogService
  ) {};

  public async createTask(
    workspaceId: string | Types.ObjectId,
    projectId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    body: CreateTaskInput,
    attachment: string | undefined
  ) {
    const {
      title,
      description,
      priority,
      status,
      assignedTo,
      startDate,
      dueDate,
    } = body;

    const project = await this.projectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
      throw new NotFoundException(
        MESSAGES.TASK.PROJECT_NOT_FOUND.message
      );
    }

    // validate assigned user is member
    if (assignedTo) {
      const isAssignedUserMember = await this.memberModel.exists({
        userId: assignedTo,
        workspaceId,
      });

      if (!isAssignedUserMember) {
        throw new BadRequestException(MESSAGES.TASK.ASSIGNED_USER_NOT_MEMBER.message);
      }
    }

    validateTaskDates(startDate, dueDate);

    const task = new this.taskModel({
      title,
      description,
      priority: priority || TaskPriorityEnum.MEDIUM,
      status: status || TaskStatusEnum.TODO,
      assignedTo,
      createdBy: userId,
      workspace: workspaceId,
      project: projectId,
      startDate: startDate ?? new Date(),
      dueDate,
      attachment,
    });

    await task.save();

    if (assignedTo) {
      await this.assignTask(
        task.id,
        toObjectId(assignedTo),
        toObjectId(userId),
        NotificationTypeEnum.TASK_ASSIGNED
      );
    }

    await this.taskLogModel.create({
      task: task._id,
      workspace: workspaceId,
      user: userId,
      action: TaskLogActionEnumType.CREATE,
      changes: [
        { field: "title", newValue: task.title },
        { field: "description", newValue: task.description },
        { field: "status", newValue: task.status },
        { field: "priority", newValue: task.priority },
        { field: "assignedTo", newValue: task.assignedTo },
        { field: "dueDate", newValue: task.dueDate },
        { field: "startDate", newValue: task.startDate },
        { field: "attachment", newValue: task.attachment },
      ],
    });

    return { task };
  }

  public async updateTask(
    workspaceId: string,
    projectId: string,
    taskId: string,
    userId: string,
    body: UpdateTaskInput,
    file?: Express.Multer.File
  ) {
    const project = await this.projectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
      throw new NotFoundException(
        MESSAGES.TASK.PROJECT_NOT_FOUND.message
      );
    }

    const task = await this.taskModel.findById(taskId);

    if (!task || task.project.toString() !== projectId.toString()) {
      throw new NotFoundException(
        MESSAGES.TASK.TASK_NOT_IN_PROJECT.message
      );
    }

    const oldTask = task.toObject();

    let attachmentUrl: string | undefined;

    if (file) {
      if (task?.attachment) {
        await deleteFile(task.attachment);
      }
      attachmentUrl = await uploadFileToS3(file, "task/attachment");
    }

    const updateData: any = {
      ...body,
      ...(attachmentUrl && { attachment: attachmentUrl }),
      ...(body.startDate !== undefined && { startDate: body.startDate }),
    };

    const updatedTask = await this.taskModel.findByIdAndUpdate(taskId, updateData, {
      new: true,
    });

    if (!updatedTask) {
      throw new BadRequestException(MESSAGES.TASK.UPDATE_FAILED.message);
    }

    const assignedToChanged =
      body.assignedTo !== undefined &&
      body.assignedTo?.toString() !== (oldTask.assignedTo?.toString() ?? null);

    if (assignedToChanged && body.assignedTo) {
      await this.assignTask(
        task.id,
        toObjectId(body.assignedTo),
        toObjectId(userId),
        NotificationTypeEnum.TASK_ASSIGNED
      );
    }

    if (!assignedToChanged) {
      await this.assignTask(
        task.id,
        toObjectId(
          (updatedTask?.assignedTo as Types.ObjectId) ??
            updatedTask?.createdBy
        ),
        toObjectId(userId),
        NotificationTypeEnum.TASK_UPDATED
      );
    }

    const changes = this.taskLogService.getTaskChanges(oldTask, updatedTask.toObject());

    if (changes.length > 0) {
      await this.taskLogModel.create({
        task: updatedTask._id,
        workspace: workspaceId,
        user: userId,
        action: TaskLogActionEnumType.UPDATE,
        changes,
      });
    }

    return { updatedTask };
  }

  public async getAllTasks(
    workspaceId: string,
    filters: TaskFilters,
    pagination: TaskPagination
  ) {
    const query: any = {
      workspace: workspaceId,
      ...(filters.projectId && { project: filters.projectId }),
      ...(filters.status?.length && { status: { $in: filters.status } }),
      ...(filters.priority?.length && { priority: { $in: filters.priority } }),
      ...(filters.assignedTo?.length && {
        assignedTo: { $in: filters.assignedTo },
      }),
      ...(filters.taskId && { _id: filters.taskId }),
      ...(filters.keyword && {
        title: { $regex: filters.keyword, $options: "i" },
      }),
      ...(filters.dueDate && { dueDate: new Date(filters.dueDate) }),
    };

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [tasks, totalCount] = await Promise.all([
      this.taskModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("assignedTo", { password: 0 })
        .populate("project", "_id emoji name"),

      this.taskModel.countDocuments(query),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        totalCount,
      },
    };
  }

  public async getTaskById(
    workspaceId: string,
    projectId: string,
    taskId: string
  ) {
    const project = await this.projectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
      throw new NotFoundException(
        MESSAGES.TASK.PROJECT_NOT_FOUND.message
      );
    }

    const task = await this.taskModel.findOne({
      _id: taskId,
      workspace: workspaceId,
      project: projectId,
    }).populate("assignedTo", "_id name profilePicture -password");

    if (!task) {
      throw new NotFoundException(MESSAGES.TASK.TASK_NOT_FOUND.message);
    }

    return task;
  }

  public async deleteTask(workspaceId: string, taskId: string, userId: string) {
    const task = await this.taskModel.findOneAndDelete({
      _id: taskId,
      workspace: workspaceId,
    });

    if (task?.attachment) await deleteFile(task.attachment);

    if (!task) {
      throw new NotFoundException(
        MESSAGES.TASK.TASK_NOT_IN_WORKSPACE.message
      );
    }

    await this.taskLogModel.create({
      task: task._id,
      workspace: workspaceId,
      user: userId,
      action: TaskLogActionEnumType.DELETE,
      changes: [],
    });

    return;
  }

  public async undoTask(taskId: Types.ObjectId, logId: Types.ObjectId) {
    const log = await this.taskLogModel.findOne({
      _id: logId,
      task: taskId,
    });

    if (!log) throw new NotFoundException(MESSAGES.TASK.LOG_NOT_FOUND.message);
    if (log.isUndone) throw new BadRequestException(MESSAGES.TASK.LOG_ALREADY_UNDONE.message);

    const update: any = {};

    log.changes.forEach((change) => {
      update[change.field] = change.oldValue;
    });

    await this.taskModel.findByIdAndUpdate(taskId, { $set: update });

    log.isUndone = true;
    await log.save();

    return { success: true };
  }

  public async redoTask(taskId: Types.ObjectId, logId: Types.ObjectId) {
    const log = await this.taskLogModel.findOne({
      _id: logId,
      task: taskId,
    });

    if (!log) throw new NotFoundException(MESSAGES.TASK.LOG_NOT_FOUND.message);
    if (!log.isUndone) throw new BadRequestException(MESSAGES.TASK.LOG_NOT_UNDONE.message);

    const update: any = {};

    log.changes.forEach((change) => {
      update[change.field] = change.newValue;
    });

    await this.taskModel.findByIdAndUpdate(taskId, { $set: update });

    log.isUndone = false;
    await log.save();

    return { success: true };
  }

  public async getTaskByObjectId(id: Types.ObjectId) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException(MESSAGES.TASK.TASK_NOT_FOUND.message);
    return task;
  }

  public async assignTask (
    taskId: Types.ObjectId,
    userId: Types.ObjectId,
    senderId: Types.ObjectId,
    type: NotificationType
  ) {
    const task = await this.taskModel.findByIdAndUpdate(
      taskId,
      { assignedTo: userId },
      { new: true }
    );
  
    await this.notificationService.create({
      type,
      receiver: userId,
      sender: senderId,
      task: task?._id as Types.ObjectId,
      workspace: task?.workspace
    });
  };

  public async checkExistTaskById(id: Types.ObjectId) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException(MESSAGES.TASK.TASK_NOT_FOUND.message);
    return task;
  }
}
