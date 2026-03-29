import { Types } from "mongoose";
import { NotificationType, NotificationTypeEnum } from "../enums/notification.enum";
import { TaskLogActionEnumType } from "../enums/task-log.enum";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskLogModel from "../models/task-log.model";
import TaskModel from "../models/task.model";
import { NotificationService } from "../modules/notification/notification.service";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { deleteFile, uploadFileToS3 } from "../utils/s3";
import { getTaskChanges } from "./task-log.service";
import { toObjectId } from "../utils/convert-objectId.util";
import { validateTaskDates } from "../utils/validate-task.util";
import { TaskFilters, TaskPagination } from "../@types/task.type";

export const createTaskService = async (
  workspaceId: string | Types.ObjectId,
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null | Types.ObjectId;
    startDate?: Date | null;
    dueDate?: Date | null;
  },
  attachment: string | undefined
) => {
  const { title, description, priority, status, assignedTo, startDate, dueDate } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  if (assignedTo) {
    const isAssignedUserMember = await MemberModel.exists({
      userId: assignedTo,
      workspaceId,
    });

    if (!isAssignedUserMember) {
      throw new Error("Assigned user is not a member of this workspace.");
    }
  }

  // validateTaskDates(startDate, dueDate);

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    startDate,
    dueDate,
    attachment
  });

  await task.save();

  if (assignedTo) {
    await assignTask(
      task.id,
      toObjectId(assignedTo),
      toObjectId(userId),
      NotificationTypeEnum.TASK_ASSIGNED
    );
  }

  await TaskLogModel.create({
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
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  body: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: string | null;
    dueDate?: Date | null;
  },
  file?: Express.Multer.File | undefined
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
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

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
      ...(attachmentUrl && { attachment: attachmentUrl }),
    },
    { new: true }
  );

  const assignedToChanged =
    body.assignedTo !== undefined &&
    body.assignedTo?.toString() !== (oldTask.assignedTo?.toString() ?? null);


  if (assignedToChanged && body.assignedTo) {
    await assignTask(
      task.id,
      toObjectId(body.assignedTo),
      toObjectId(userId),
      NotificationTypeEnum.TASK_ASSIGNED
    )
  }

  if (!assignedToChanged) {
    await assignTask(
      task.id,
      toObjectId(updatedTask?.assignedTo as Types.ObjectId ?? updatedTask?.createdBy),
      toObjectId(userId),
      NotificationTypeEnum.TASK_UPDATED
    )
  }

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  const changes = getTaskChanges(oldTask, updatedTask.toObject());

  if (changes.length > 0) {
    await TaskLogModel.create({
      task: updatedTask._id,
      workspace: workspaceId,
      user: userId,
      action: TaskLogActionEnumType.UPDATE,
      changes,
    });
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: TaskFilters,
  pagination: TaskPagination
) => {
  const query = {
    workspace: workspaceId,
    ...(filters.projectId && { project: filters.projectId }),
    ...(filters.status?.length && { status: { $in: filters.status } }),
    ...(filters.priority?.length && { priority: { $in: filters.priority } }),
    ...(filters.assignedTo?.length && { assignedTo: { $in: filters.assignedTo } }),
    ...(filters.taskId && { _id: filters.taskId }),
    ...(filters.keyword && { title: { $regex: filters.keyword, $options: "i" } }),
    ...(filters.dueDate && { dueDate: new Date(filters.dueDate) }),
  };

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", { password: 0 })
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string,
  userId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (task?.attachment) await deleteFile(task.attachment);

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  await TaskLogModel.create({
    task: task._id,
    workspace: workspaceId,
    user: userId,
    action: TaskLogActionEnumType.DELETE,
    changes: [],
  });

  return;
};

export const assignTask = async (
  taskId: Types.ObjectId,
  userId: Types.ObjectId,
  senderId: Types.ObjectId,
  type: NotificationType
) => {
  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    { assignedTo: userId },
    { new: true }
  );

  await NotificationService.create({
    type,
    receiver: userId,
    sender: senderId,
    task: task?._id as Types.ObjectId,
    workspace: task?.workspace
  });
}


export const undoTask = async (taskId: Types.ObjectId, logId: Types.ObjectId) => {
  try {
    const log = await TaskLogModel.findOne({
      _id: logId,
      task: taskId
    });

    if (!log) throw new NotFoundException("Log not found for this task");
    if (log.isUndone) throw new BadRequestException("Log already undone");


    const update: any = {};

    log.changes.forEach(change => {
      update[change.field] = change.oldValue;
    });

    await TaskModel.findByIdAndUpdate(
      taskId,
      { $set: update },
    );

    log.isUndone = true;
    await log.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
}

export const redoTask = async (taskId: Types.ObjectId, logId: Types.ObjectId) => {
  try {
    const log = await TaskLogModel.findOne({
      _id: logId,
      task: taskId
    });

    if (!log) throw new NotFoundException("Log not found for this task");
    if (!log.isUndone) throw new BadRequestException("Log is not undone");

    const update: any = {};

    log.changes.forEach(change => {
      update[change.field] = change.newValue;
    });

    await TaskModel.findByIdAndUpdate(
      taskId,
      { $set: update },
    );

    log.isUndone = false;
    await log.save();

    return { success: true };
  } catch (error) {
    throw error;
  }
}

export const getTaskById = async (id: Types.ObjectId) => {
  try {
    const task = await TaskModel.findById(id);
    if (!task) throw new NotFoundException("task notfound");
    return task;
  } catch (error) {
    throw error;
  }
}
