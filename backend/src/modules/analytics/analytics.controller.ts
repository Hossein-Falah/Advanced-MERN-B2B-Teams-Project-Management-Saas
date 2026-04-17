import { NextFunction, Request, Response } from "express";
import { HTTPSTATUS } from "../../config/http.config";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsType } from "./types/analytics.type";
import { MemberService } from "../member/member.service";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { profileActivitySchema } from "./analytics.validator";
import { ResponseHandler } from "../../common/response/response-handler";
import { MESSAGES } from "../../common/constants/message.constant";
import { projectIdSchema, workspaceIdSchema } from "../../common/validator/common.validator";
import { AnalyticsTaskTypeEnum } from "../../common/enums/analytics.enum";
import { parseDateOrThrow } from "../../utils/parse-date";

export class AnalyticsController {
    constructor(
        private analyticsService: AnalyticsService,
        private memberService: MemberService
    ) { }

    public getWorkspaceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const { workspaceId } = req.params;
            const { type = AnalyticsType.ALL, projectId, treandRange = "7" } = req.query;

            const project = projectIdSchema.optional().parse(projectId);
            const workspace = workspaceIdSchema.parse(workspaceId);

            const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId as string);
            roleGuard(role, [Permissions.VIEW_ANALYTICS]);

            const analytics = await this.analyticsService.generateAnalytics(
                workspace as string,
                userId,
                type as AnalyticsType,
                project as string | undefined,
                +treandRange
            );

            return ResponseHandler.send(res, {
                success: true,
                code: MESSAGES.ANALYTICS.code,
                message: MESSAGES.ANALYTICS.message,
                statusCode: HTTPSTATUS.OK,
                data: analytics
            })
        } catch (error) {
            next(error);
        }
    }

    public getProfileActivity = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            const { workspaceId, date } = profileActivitySchema.parse(req.query);

            const profile = await this.analyticsService.getUserDailyActivity(
                workspaceId as string,
                userId as string,
                date
            );

            return ResponseHandler.send(res, {
                success: true,
                code: MESSAGES.ANALYTICS.code,
                message: MESSAGES.ANALYTICS.message,
                statusCode: HTTPSTATUS.OK,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    public getTaskAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, start_date, end_date, projectId } = req.query;
    
            const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
            const projectID = projectId ? projectIdSchema.optional().parse(projectId) : undefined;
    
            const startDate = parseDateOrThrow(start_date, "start_date");
            const endDate = parseDateOrThrow(end_date, "end_date");
    
            const taskAnalytics = await this.analyticsService.getTaskAnalytics(
                workspaceId,
                type as AnalyticsTaskTypeEnum,
                startDate,
                endDate,
                projectID
            );
    
            return ResponseHandler.send(res, {
                success: true,
                code: MESSAGES.ANALYTICS.code,
                message: MESSAGES.ANALYTICS.message,
                statusCode: HTTPSTATUS.OK,
                data: { taskAnalytics }
            });
        } catch (error) {
            next(error);
        }
    };
    
    public getProjectAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {    
            const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    
            const projectAnalytics = await this.analyticsService.getProjectAnalytics(workspaceId);
    
            return ResponseHandler.send(res, {
                success: true,
                code: MESSAGES.ANALYTICS.code,
                message: MESSAGES.ANALYTICS.message,
                statusCode: HTTPSTATUS.OK,
                data: { projectAnalytics }
            });
        } catch (error) {
            next(error);
        }
    };
    
    public getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start_date, end_date } = req.query;
    
            const workspaceID = workspaceIdSchema.parse(req.params.workspaceId);
    
            const startDate = parseDateOrThrow(start_date, "start_date");
            const endDate = parseDateOrThrow(end_date, "end_date");
    
            const userAnalytics = await this.analyticsService.getUserAnalytics(
                workspaceID,
                startDate,
                endDate
            );
    
            return ResponseHandler.send(res, {
                success: true,
                code: MESSAGES.ANALYTICS.code,
                message: MESSAGES.ANALYTICS.message,
                statusCode: HTTPSTATUS.OK,
                data: { userAnalytics }
            });
        } catch (error) {
            next(error);
        }
    };
}
