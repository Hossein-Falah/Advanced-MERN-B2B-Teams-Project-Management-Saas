import mongoose, { Types } from "mongoose";
import { NotificationTypeEnum } from "../enums/notification.enum";
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

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  },
  attachment: string | undefined
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;

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

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
    attachment
  });

  await task.save();

  if (assignedTo) {
    await assignTask(task.id, toObjectId(assignedTo), toObjectId(userId));
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
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
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

  if (file && task?.attachment) {
    await deleteFile(task?.attachment);
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

  if (body.assignedTo) {
    await assignTask(task.id, toObjectId(body.assignedTo), toObjectId(userId))
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
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

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

export const assignTask = async (taskId: Types.ObjectId, userId: Types.ObjectId, senderId: Types.ObjectId) => {
  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    { assignedTo: userId },
    { new: true }
  );

  await NotificationService.create({
    type: NotificationTypeEnum.TASK_ASSIGNED,
    receiver: userId,
    sender: senderId,
    task: task?._id as Types.ObjectId,
    workspace: task?.workspace
  });
}


export const undoTask = async (taskId: Types.ObjectId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const log = await TaskLogModel.findOne({
      task: taskId,
      isUndone: false
    }).sort({ createdAt: -1 });

    if (!log) throw new NotFoundException("Nothing to undo");

    const update: any = {};

    log.changes.forEach(change => {
      update[change.field] = change.oldValue;
    });

    await TaskModel.findByIdAndUpdate(taskId, { $set: update });

    log.isUndone = true;
    await log.save();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

export const redoTask = async (taskId: Types.ObjectId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const log = await TaskLogModel.findOne({
      task: taskId,
      isUndone: true
    }).sort({ createdAt: -1 });

    if (!log) throw new NotFoundException("Nothing to redo");

    const update: any = {};

    log.changes.forEach(change => {
      update[change.field] = change.newValue;
    });

    await TaskModel.findByIdAndUpdate(taskId, { $set: update });

    log.isUndone = false;
    await log.save();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
