import { TaskDocument } from "../../models/task.model";
import { toObjectId } from "../../utils/convert-objectId.util";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsGroup } from "./interfaces/analytics.interface";
import { AnalyticsType } from "./types/analytics.type";

export class AnalyticsService {
    constructor(private analyticsRepository: AnalyticsRepository) { }

    async generateAnalytics(
        workspaceId: string,
        userId: string,
        type: AnalyticsType,
        projectId?: string,
        treandRange: number = 7
    ) {
        const baseFilter: Partial<TaskDocument> = {
            workspace: toObjectId(workspaceId),
            ...(projectId && { project: toObjectId(projectId) })
        };

        const personalFilter = { ...baseFilter, assignedTo: toObjectId(userId) };
        const teamFilter = baseFilter;

        const response: any = { analytics: {} };

        if (type === AnalyticsType.TEAM || type === AnalyticsType.ALL) {
            response.analytics.team = await this.computeGroupStats(teamFilter, treandRange);
        }

        if (type === AnalyticsType.PERSONAL || type === AnalyticsType.ALL) {
            response.analytics.personal = await this.computeGroupStats(personalFilter, treandRange);
        }

        return response;
    }

    private async computeGroupStats(filter: Partial<TaskDocument>, treandRange: number): Promise<AnalyticsGroup> {
        const [
            todayTasks,
            overdueTasks,
            completedTasks,
            inProgressTasks
        ] = await Promise.all([
            this.analyticsRepository.getCreatedStats(filter, treandRange),
            this.analyticsRepository.getOverdueStats(filter, treandRange),
            this.analyticsRepository.getCompletedStats(filter, treandRange),
            this.analyticsRepository.getInProgressStats(filter, treandRange)
        ]);

        return {
            todayTasks,
            overdueTasks,
            completedTasks,
            inProgressTasks
        }
    }
}
