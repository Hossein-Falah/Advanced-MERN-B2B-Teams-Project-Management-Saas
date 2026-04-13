import { Model, Types } from "mongoose";
import { TaskDocument } from "../task/task.model";
import { TaskLogDocument } from "./task-log.model";
import { TaskLogCreateType } from "./types/task-log.type";
import { MESSAGES } from "../../common/constants/message.constant";
import { NotFoundException } from "../../common/errors/app-error";
import { PaginationFilter } from "../../common/types/pagination.type";

export class TaskLogService {
    constructor(
        private taskModel: Model<TaskDocument>,
        private taskLogModel: Model<TaskLogDocument>
    ) { }

    async createLog({ taskId, workspaceId, userId, action, changes }: TaskLogCreateType) {
        if (!changes || changes.length === 0) return;

        await this.taskLogModel.create({
            task: taskId,
            workspace: workspaceId,
            user: userId,
            action,
            changes,
        });
    }

    getTaskChanges(oldTask: any, newTask: any) {
        const changes = [];

        const fields = [
            "title",
            "description",
            "status",
            "priority",
            "assignedTo",
            "attachment",
            "startDate",
            "dueDate",
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

    async updateTask(taskId: Types.ObjectId, data: any, userId: Types.ObjectId) {
        const oldTask = await this.taskModel.findById(taskId);

        if (!oldTask) {
            throw new NotFoundException(MESSAGES.TASK_LOG.TASK_NOT_FOUND.message);
        }

        const updatedTask = await this.taskModel.findByIdAndUpdate(taskId, data, {
            new: true,
        });

        const changes = this.getTaskChanges(oldTask.toObject(), updatedTask?.toObject());

        await this.createLog({
            taskId: updatedTask?._id as Types.ObjectId,
            workspaceId: updatedTask?.workspace as Types.ObjectId,
            userId,
            action: "UPDATE",
            changes,
        });

        return updatedTask;
    }

    async getTaskLogs({ page, limit }: PaginationFilter, taskId: string) {
        const skip = (page - 1) * limit;

        const logs = await this.taskLogModel.find({ task: taskId })
            .populate("user", "name email profilePicture username -password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await this.taskLogModel.countDocuments({ task: taskId });

        return {
            logs,
            pagination: {
                page,
                limit,
                total
            },
        };
    }
}
