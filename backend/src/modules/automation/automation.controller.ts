import { NextFunction, Request, Response } from "express";
import { AutomationService } from "./services/automation.service";
import { automationValidatorSchema, updateAutomationValidatorSchema } from "./automation.validation";
import { MemberService } from "../member/member.service";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import calculateNextRun from "../../utils/calculateNextRun";
import { toObjectId } from "../../utils/convert-objectId.util";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { automationIdSchema, taskIdSchema, workspaceIdSchema } from "../../common/validator/common.validator";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";
import { buildPaginationMeta } from "../../utils/pagination-meta";

export class AutomationController {
    constructor(
        private memberService: MemberService,
        private automationService: AutomationService,
    ) { }

    public createAutomation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const workspaceID = workspaceIdSchema.parse(req.params.workspaceId);

            const { taskId, type, daysOfWeek, timeOfDay } =
                automationValidatorSchema.parse(req.body);

            const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);   
            roleGuard(role, [Permissions.CREATE_AUTOMATION]);

            const nextRunAt = await calculateNextRun(daysOfWeek, timeOfDay);

            const automation = await this.automationService.create({
                taskId: toObjectId(taskId),
                userId,
                type,
                daysOfWeek,
                timeOfDay,
                nextRunAt,
                workspaceId: toObjectId(workspaceID),
            });

            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.AUTOMATION.CREATED.code,
                message: MESSAGES.AUTOMATION.CREATED.message,
                data: { automation },
            });
        } catch (error) {
            next(error);
        }
    }

    public getAutomations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const taskId = taskIdSchema
                .optional()
                .parse(req.query.taskId)

            const paginationFilter = paginationQuerySchema.parse(req.query)

            const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

            const { automations, pagination } = await this.automationService.getAutomations(
                paginationFilter,
                toObjectId(workspaceId),
                userId,
                taskId
            );

            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.AUTOMATION.FETCHED.code,
                message: MESSAGES.AUTOMATION.FETCHED.message,
                data: { automations },
                meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.total)
            });
        } catch (error) {
            next(error);
        }
    }

    public getAutomation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const { workspaceId, automationId } = req.params;

            const workspaceID = workspaceIdSchema.parse(workspaceId);
            const automationID = automationIdSchema.parse(automationId);

            const automation = await this.automationService.getAutomationById(
                toObjectId(automationID),
                toObjectId(workspaceID),
                userId
            );

            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.AUTOMATION.FETCHED_ONE.code,
                message: MESSAGES.AUTOMATION.FETCHED_ONE.message,
                data: { automation },
            });
        } catch (error) {
            next(error);
        }
    }

    public updateAutomation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const { workspaceId, automationId } = req.params;

            const workspaceID = workspaceIdSchema.parse(workspaceId);
            const automationID = automationIdSchema.parse(automationId);

            const body = updateAutomationValidatorSchema.parse(req.body);

            const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);

            roleGuard(role, [Permissions.EDIT_AUTOMATION]);

            const automation = await this.automationService.updateAutomation(
                toObjectId(automationID),
                body,
                toObjectId(userId),
                toObjectId(workspaceID)
            );

            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.AUTOMATION.UPDATED.code,
                message: MESSAGES.AUTOMATION.UPDATED.message,
                data: { automation },
            });
        } catch (error) {
            next(error);
        }
    }

    public deleteAutomation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const { workspaceId, automationId } = req.params;

            const workspaceID = workspaceIdSchema.parse(workspaceId);
            const automationID = automationIdSchema.parse(automationId);

            const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
            roleGuard(role, [Permissions.DELETE_AUTOMATION]);

            const automation = await this.automationService.deleteAutomation(
                toObjectId(automationID),
                toObjectId(workspaceID),
                userId
            );

            return ResponseHandler.send(res, {
                statusCode: HTTPSTATUS.OK,
                code: MESSAGES.AUTOMATION.DELETED.code,
                message: MESSAGES.AUTOMATION.DELETED.message,
                data: { automation },
            });
        } catch (error) {
            next(error);
        }
    }
}
