import mongoose, { Types } from "mongoose";
import TaskLogModel, { TaskLogChangeType } from "../models/task-log.model";
import { TaskLogActionType } from "../enums/task-log.enum";
import TaskModel from "../models/task.model";

export const createLog = async ({
    taskId,
    workspaceId,
    userId,
    action,
    changes,
}: {
    taskId: mongoose.Types.ObjectId,
    workspaceId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    action: TaskLogActionType,
    changes: TaskLogChangeType,
}) => {
    if (!changes || changes.length === 0) return;

    await TaskLogModel.create({
        task: taskId,
        workspace: workspaceId,
        user: userId,
        action,
        changes,
    });
}

export const getTaskChanges = (oldTask: any, newTask: any) => {
    const changes = [];

    const fields = [
        "title",
        "description",
        "status",
        "priority",
        "assignedTo",
        "attachment",
        "dueDate"
    ];

    for (const field of fields) {
        const oldValue = oldTask[field];
        const newValue = newTask[field];

        if (String(oldValue) !== String(newValue)) {
            changes.push({
                field,
                oldValue,
                newValue,
            });
        }
    }

    return changes;
}

export const updateTask = async (taskId: mongoose.Types.ObjectId, data: any, userId: mongoose.Types.ObjectId) => {
    const oldTask = await TaskModel.findById(taskId);

    if (!oldTask) throw new Error("Task not found");

    const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        data,
        { new: true }
    );

    const changes = getTaskChanges(oldTask.toObject(), updatedTask?.toObject());

    await createLog({
        taskId: updatedTask?._id as Types.ObjectId,
        workspaceId: updatedTask?.workspace as Types.ObjectId,
        userId,
        action: "UPDATE",
        changes,
    });

    return updatedTask;
}

export const getTaskLogsService = async (
    taskId: string,
    page: number = 1,
    limit: number = 20
) => {
    const skip = (page - 1) * limit;

    const logs = await TaskLogModel.find({ task: taskId })
        .populate("user", "name email -password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await TaskLogModel.countDocuments({ task: taskId });

    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
};
