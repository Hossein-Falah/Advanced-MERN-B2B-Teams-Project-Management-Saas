import { Types } from "mongoose";
import TaskModel from "../../../models/task.model";
import { createTaskService } from "../../../services/task.service";
import { NotFoundException } from "../../../utils/appError";
import calculateNextRun from "../../../utils/calculateNextRun";
import AutomationModel, { AutomationDocument } from "../automation.model";

export class AutomationService {
    static async create(automation: Partial<AutomationDocument>) {
        return await AutomationModel.create(automation);
    };

    static async runTask(automation: AutomationDocument) {
        const task = await TaskModel.findById(automation.taskId);

        if (!task) return;

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
                dueDate: task.dueDate!
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

    static async getAutomations(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            AutomationModel.find()
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

    static async getAutomationById(id: Types.ObjectId): Promise<AutomationDocument | null> {
        const automation = await AutomationModel.findById(id);
        if (!automation) throw new NotFoundException("automation مورد نظر پیدا نشد");
        return automation;
    }

    static async updateAutomation(id: Types.ObjectId, payload: Partial<any>) {
        await this.getAutomationById(id);

        return await AutomationModel.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        );
    }

    static async deleteAutomation(id: Types.ObjectId) {
        await this.getAutomationById(id);
        return await AutomationModel.findByIdAndDelete(id);
    }
}
