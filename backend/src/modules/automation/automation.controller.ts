import { Request, Response } from "express";
import { AutomationService } from "./services/automation.service";
import { workspaceIdSchema } from "../workspace/workspace.validation";
import { automationValidatorSchema, updateAutomationValidatorSchema } from "./automation.validation";
import { MemberService } from "../member/member.service";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import calculateNextRun from "../../utils/calculateNextRun";
import { toObjectId } from "../../utils/convert-objectId.util";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { taskIdSchema } from "../task/task.validation";

export class AutomationController {
    constructor(
        private automationService: AutomationService,
        private memberService: MemberService
    ) { }

    async createAutomation(req: Request, res: Response) {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const { taskId, type, daysOfWeek, timeOfDay } =
            automationValidatorSchema.parse(req.body);

        const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);

        roleGuard(role, [Permissions.CREATE_AUTOMATION]);

        const nextRunAt = await calculateNextRun(daysOfWeek, timeOfDay);

        const automation = await this.automationService.create({
            taskId: toObjectId(taskId),
            userId,
            type,
            daysOfWeek,
            timeOfDay,
            nextRunAt,
            workspaceId: toObjectId(workspaceId),
        });

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.AUTOMATION.CREATED.code,
            message: MESSAGES.AUTOMATION.CREATED.message,
            data: automation,
        });
    }

    async getAutomations(req: Request, res: Response) {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const automation = await this.automationService.getAutomations(
            page,
            limit,
            toObjectId(workspaceId),
            userId
        );

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.AUTOMATION.FETCHED.code,
            message: MESSAGES.AUTOMATION.FETCHED.message,
            data: automation,
        });
    }

    async getAutomation(req: Request, res: Response) {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const automationId = taskIdSchema.parse(req.params.automationId);

        const automation = await this.automationService.getAutomationById(
            toObjectId(automationId),
            toObjectId(workspaceId),
            userId
        );

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.AUTOMATION.FETCHED_ONE.code,
            message: MESSAGES.AUTOMATION.FETCHED_ONE.message,
            data: automation,
        });
    }

    async updateAutomation(req: Request, res: Response) {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const automationId = taskIdSchema.parse(req.params.automationId);

        const body = updateAutomationValidatorSchema.parse(req.body);

        const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);

        roleGuard(role, [Permissions.EDIT_AUTOMATION]);

        const automation = await this.automationService.updateAutomation(
            toObjectId(automationId),
            body,
            toObjectId(userId),
            toObjectId(workspaceId)
        );

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.AUTOMATION.UPDATED.code,
            message: MESSAGES.AUTOMATION.UPDATED.message,
            data: automation,
        });
    }

    async deleteAutomation(req: Request, res: Response) {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const automationId = taskIdSchema.parse(req.params.automationId);

        const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);

        roleGuard(role, [Permissions.DELETE_AUTOMATION]);

        await this.automationService.deleteAutomation(
            toObjectId(automationId),
            toObjectId(workspaceId),
            userId
        );

        return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.AUTOMATION.DELETED.code,
            message: MESSAGES.AUTOMATION.DELETED.message,
            data: null,
        });
    }
}
