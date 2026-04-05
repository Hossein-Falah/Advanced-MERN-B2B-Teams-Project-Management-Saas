import { Types } from "mongoose";
import { createTaskService, getTaskById } from "../../../services/task.service";
import { BadRequestException, NotFoundException } from "../../../utils/appError";
import calculateNextRun from "../../../utils/calculateNextRun";
import AutomationModel, { AutomationDocument } from "../automation.model";

export class AutomationService {
    static async create(automation: Partial<AutomationDocument>) {
        const task = await getTaskById(automation.taskId as Types.ObjectId);

        if (!task.startDate || !task.dueDate) {
            throw new BadRequestException("Task must have startDate and dueDate to create automation");
        }

        const durationMs = task.dueDate.getTime() - task.startDate.getTime();        

        if (durationMs <= 0) {
            throw new BadRequestException("Invalid task duration");
        }
    
        return await AutomationModel.create({ ...automation, durationMs });
    };

    static async runTask(automation: AutomationDocument) {
        const task = await getTaskById(automation.taskId);

        const now = new Date();
        
        await createTaskService(
            task.workspace,
            task.project,
            task.createdBy,
            {
                title: task.title,
                description: task.description!,
                priority: task.priority,
                status: task.status,
                assignedTo: task.assignedTo!,
                startDate: now,
                dueDate: new Date(now.getTime() + automation.durationMs),    
            },
            task.attachment
        )

        const nextRun = await calculateNextRun(
            automation.daysOfWeek,
            automation.timeOfDay
        );

        automation.lastRunAt = new Date();
        automation.nextRunAt = nextRun;

        await automation.save();
    };

    static async getAutomations(page = 1, limit = 10, workspaceId: Types.ObjectId, userId: Types.ObjectId) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            AutomationModel.find({ workspaceId, userId })
                .populate({ path: "taskId", select: "_id title description" })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            AutomationModel.countDocuments()
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    static async getAutomationById(
        id: Types.ObjectId, 
        workspaceId: Types.ObjectId, 
        userId: Types.ObjectId
    ): Promise<AutomationDocument | null> {
        const automation = await AutomationModel.findOne({ _id: id, workspaceId, userId });
        if (!automation) throw new NotFoundException("automation مورد نظر پیدا نشد");
        return automation;
    }

    static async updateAutomation(
        id: Types.ObjectId, 
        payload: Partial<any>,
        userId: Types.ObjectId,
        workspaceId: Types.ObjectId
    ) {
        const automation = await this.getAutomationById(id, workspaceId, userId);

        const scheduleFieldsChanged = 
            payload?.daysOfWeek || 
            payload?.timeOfDay || 
            payload?.timezone ||
            payload?.active !== undefined

        if (scheduleFieldsChanged) {
            const daysOfWeek = payload.daysOfWeek ?? automation?.daysOfWeek;
            const timeOfDay = payload.timeOfDay ?? automation?.timeOfDay;
            const timezone = payload.timezone ?? automation?.timezone;

            if (payload?.active === false) {
                payload.nextRunAt = null;
            } else {
                payload.nextRunAt = await calculateNextRun(daysOfWeek, timeOfDay, timezone)
            }
        }

        return await AutomationModel.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        );
    }

    static async deleteAutomation(id: Types.ObjectId, workspaceId: Types.ObjectId, userId: Types.ObjectId,) {
        await this.getAutomationById(id, workspaceId, userId);
        return await AutomationModel.findByIdAndDelete(id);
    }
}
