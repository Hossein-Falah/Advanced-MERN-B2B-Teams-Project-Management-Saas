import { Request, Response } from "express";
import { HTTPSTATUS } from "../../config/http.config";
import { AnalyticsService } from "./analytics.service";
import { projectIdSchema } from "../project/project.validation";
import { workspaceIdSchema } from "../workspace/workspace.validation";
import { AnalyticsType } from "./types/analytics.type";
import { MemberService } from "../member/member.service";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { profileActivitySchema } from "./analytics.validator";
import { ResponseHandler } from "../../common/response/response-handler";
import { MESSAGES } from "../../common/constants/message.constant";

export class AnalyticsController {
    constructor(
        private analyticsService: AnalyticsService,
        private memberService: MemberService
    ) { }

    public getWorkspaceAnalytics = async (req: Request, res: Response) => {
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
    }

    public getProfileActivity = async (req: Request, res: Response) => {
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
        })
    }
}
