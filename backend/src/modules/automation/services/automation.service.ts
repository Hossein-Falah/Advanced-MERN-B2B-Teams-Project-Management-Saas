import { Model } from "mongoose";
import { Types } from "mongoose";
import calculateNextRun from "../../../utils/calculateNextRun";
import { AutomationDocument } from "../automation.model";
import { BadRequestException, NotFoundException } from "../../../common/errors/app-error";
import { TaskService } from "../../task/task.service";
import { MESSAGES } from "../../../common/constants/message.constant";
import { PaginationFilter } from "../../../common/types/pagination.type";
import { toObjectId } from "../../../utils/convert-objectId.util";

export class AutomationService {
    constructor(
        private automationModel: Model<AutomationDocument>,
        private taskService: TaskService
    ) { }

    public async create(automation: Partial<AutomationDocument>) {
        const task = await this.taskService.checkExistTaskById(automation.taskId as Types.ObjectId);

        if (!task.startDate || !task.dueDate) {
            throw new BadRequestException("Task must have startDate and dueDate to create automation");
        }

        const durationMs = task.dueDate.getTime() - task.startDate.getTime();

        if (durationMs <= 0) {
            throw new BadRequestException("Invalid task duration");
        }

        return await this.automationModel.create({ ...automation, durationMs });
    };

    public async runTask(automation: AutomationDocument) {
        const task = await this.taskService.checkExistTaskById(automation.taskId);

        const now = new Date();

        await this.taskService.createTask(
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
        )

        const nextRun = await calculateNextRun(
            automation.daysOfWeek,
            automation.timeOfDay
        );

        automation.lastRunAt = new Date();
        automation.nextRunAt = nextRun;

        await automation.save();
    };

    public async getAutomations(
        { page, limit }: PaginationFilter,
        workspaceId: Types.ObjectId, 
        userId: Types.ObjectId, 
        taskId?: string | null
    ) {
        const skip = (page - 1) * limit;
        
        const [automations, total] = await Promise.all([
            this.automationModel.find({ 
                workspaceId, 
                userId,  
                ...(taskId && { taskId: toObjectId(taskId) })
            })
                .populate({ path: "taskId", select: "_id title description" })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            this.automationModel.countDocuments({ workspaceId, userId })
        ]);

        return {
            automations,
            pagination: {
                page,
                limit,
                total
            }
        };
    }

    public async getAutomationById(
        id: Types.ObjectId,
        workspaceId: Types.ObjectId,
        userId: Types.ObjectId
    ): Promise<AutomationDocument | null> {
        const automation = await this.automationModel.findOne({ _id: id, workspaceId, userId });
        if (!automation) throw new NotFoundException(MESSAGES.AUTOMATION.NOT_FOUND.message);
        return automation;
    }

    public async updateAutomation(
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

        return await this.automationModel.findByIdAndUpdate(
            id,
            payload,
            { new: true }
        );
    }

    public async deleteAutomation(id: Types.ObjectId, workspaceId: Types.ObjectId, userId: Types.ObjectId) {
        await this.getAutomationById(id, workspaceId, userId);
        return await this.automationModel.findByIdAndDelete(id);
    }
}
