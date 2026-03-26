import { Request, Response } from "express";
import calculateNextRun from "../../utils/calculateNextRun";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { automationValidatorSchema, updateAutomationValidatorSchema } from "./automation.validation";
import { AutomationService } from "./services/automation.service";
import { toObjectId } from "../../utils/convert-objectId.util";
import { taskIdSchema } from "../../validation/task.validation";

export const createAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const { taskId, type, daysOfWeek, timeOfDay } = automationValidatorSchema.parse(req.body);

        const nextRunAt = await calculateNextRun(daysOfWeek, timeOfDay);

        const automation = await AutomationService.create({
            taskId: toObjectId(taskId),
            type,
            daysOfWeek,
            timeOfDay,
            nextRunAt
        })

        return res.status(HTTPSTATUS.OK).json(automation);
    }
);

export const getAllAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const automation = await AutomationService.getAutomations(page, limit);

        return res.status(HTTPSTATUS.OK).json(automation)
    }
);

export const getOneAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const automationId = taskIdSchema.parse(req.params.automationId);

        const automation = await AutomationService.getAutomationById(toObjectId(automationId));

        return res.status(HTTPSTATUS.OK).json(automation);
    }
)

export const updateAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const automationId = taskIdSchema.parse(req.params.automationId);

        const body = updateAutomationValidatorSchema.parse(req.body);

        const automation = await AutomationService.updateAutomation(toObjectId(automationId), body);

        return res.status(HTTPSTATUS.OK).json(automation);
    }
)

export const deleteAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const automationId = taskIdSchema.parse(req.params.automationId);

        await AutomationService.deleteAutomation(toObjectId(automationId));

        return res.status(HTTPSTATUS.OK).json({
            message: "Automation deleted successfully"
        });
    }
)
