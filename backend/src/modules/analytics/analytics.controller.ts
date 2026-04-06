import { Request, Response } from "express";
import { HTTPSTATUS } from "../../config/http.config";
import { AnalyticsService } from "./analytics.service";
import { projectIdSchema } from "../../validation/project.validation";
import { workspaceIdSchema } from "../../validation/workspace.validation";
import { AnalyticsType } from "./types/analytics.type";
import { getMemberRoleInWorkspace } from "../../services/member.service";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";
import { profileActivitySchema } from "./analytics.validator";

export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    public getWorkspaceAnalytics = async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id;
            const { workspaceId } = req.params;
            const { type = AnalyticsType.ALL, projectId, treandRange = "7" } = req.query;

            const project = projectIdSchema.optional().parse(projectId);
            const workspace = workspaceIdSchema.parse(workspaceId);

            const { role } = await getMemberRoleInWorkspace(userId, workspaceId as string);
            roleGuard(role, [Permissions.VIEW_ANALYTICS]);

            const analytics = await this.analyticsService.generateAnalytics(
                workspace as string,
                userId,
                type as AnalyticsType,
                project as string | undefined,
                +treandRange
            );

            res.status(HTTPSTATUS.OK).json(analytics);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Failed to load analytics",
            });
        }
    }

    public getProfileActivity = async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id;

            const { workspaceId, date } = profileActivitySchema.parse(req.query);

            const result = await this.analyticsService.getUserDailyActivity(
                workspaceId as string,
                userId as string,
                date
            );

            return res.status(HTTPSTATUS.OK).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to load profile analytics",
            });
        }
    }
}
