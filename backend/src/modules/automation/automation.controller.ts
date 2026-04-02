import { Request, Response } from "express";
import calculateNextRun from "../../utils/calculateNextRun";
import { HTTPSTATUS } from "../../config/http.config";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { automationValidatorSchema, updateAutomationValidatorSchema } from "./automation.validation";
import { AutomationService } from "./services/automation.service";
import { toObjectId } from "../../utils/convert-objectId.util";
import { taskIdSchema } from "../../validation/task.validation";
import { workspaceIdSchema } from "../../validation/workspace.validation";
import { getMemberRoleInWorkspace } from "../../services/member.service";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";

export const createAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const { taskId, type, daysOfWeek, timeOfDay } = automationValidatorSchema.parse(req.body);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.CREATE_AUTOMATION]);

        const nextRunAt = await calculateNextRun(daysOfWeek, timeOfDay);

        const automation = await AutomationService.create({
            taskId: toObjectId(taskId),
            userId,
            type,
            daysOfWeek,
            timeOfDay,
            nextRunAt,
            workspaceId: toObjectId(workspaceId)
        })

        return res.status(HTTPSTATUS.OK).json(automation);
    }
);

export const getAllAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const automation = await AutomationService.getAutomations(page, limit, toObjectId(workspaceId), userId);

        return res.status(HTTPSTATUS.OK).json(automation)
    }
);

export const getOneAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
        const automationId = taskIdSchema.parse(req.params.automationId);

        const automation = await AutomationService.getAutomationById(
            toObjectId(automationId),
            toObjectId(workspaceId),
            userId
        );

        return res.status(HTTPSTATUS.OK).json(automation);
    }
)

export const updateAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
        const automationId = taskIdSchema.parse(req.params.automationId);

        const body = updateAutomationValidatorSchema.parse(req.body);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.EDIT_AUTOMATION]);

        const automation = await AutomationService.updateAutomation(
            toObjectId(automationId), 
            body, 
            toObjectId(userId),
            toObjectId(workspaceId)
        );

        return res.status(HTTPSTATUS.OK).json(automation);
    }
)

export const deleteAutomationController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
        const automationId = taskIdSchema.parse(req.params.automationId);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.DELETE_AUTOMATION]);

        await AutomationService.deleteAutomation(
            toObjectId(automationId),
            toObjectId(workspaceId),
            userId
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "Automation deleted successfully"
        });
    }
)
