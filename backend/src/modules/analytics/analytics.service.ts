import { DateTime } from "luxon";
import { FilterQuery } from "mongoose";

import { TaskDocument } from "../../models/task.model";
import { toObjectId } from "../../utils/convert-objectId.util";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsGroup } from "./interfaces/analytics.interface";
import { AnalyticsType } from "./types/analytics.type";
import { getUserById } from "../../services/user.service";

export class AnalyticsService {
    constructor(private analyticsRepository: AnalyticsRepository) { }

    async generateAnalytics(
        workspaceId: string,
        userId: string,
        type: AnalyticsType,
        projectId?: string,
        treandRange: number = 7
    ) {
        const baseFilter: FilterQuery<TaskDocument> = {
            workspace: toObjectId(workspaceId),
            ...(projectId && { project: toObjectId(projectId) })
        };

        const personalFilter: FilterQuery<TaskDocument> = { ...baseFilter, assignedTo: toObjectId(userId) };
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

    private async computeGroupStats(filter: FilterQuery<TaskDocument>, treandRange: number): Promise<AnalyticsGroup> {
        const [
            todayTasks,
            overdueTasks,
            completedTasks,
            inProgressTasks
        ] = await Promise.all([
            this.analyticsRepository.getCreatedStats(filter, treandRange),
            this.analyticsRepository.getOverdueStats(filter, treandRange),
            this.analyticsRepository.getCompletedStats(filter, treandRange),
            this.analyticsRepository.getInProgressStats(filter)
        ]);

        return {
            todayTasks,
            overdueTasks,
            completedTasks,
            inProgressTasks
        }
    }

    public async getUserDailyActivity(
        workspaceId: string,
        userId: string,
        date?: Date
    ) {
        const user = await getUserById(userId);

        const baseDate = date ?? new Date();

        const dayStart = DateTime
            .fromJSDate(baseDate, { zone: user.region })
            .startOf("day")
            .toUTC()
            .toJSDate();

        const dayEnd = DateTime
            .fromJSDate(baseDate, { zone: user.region })
            .endOf("day")
            .toUTC()
            .toJSDate();


        const data = await this.analyticsRepository.getUserDailyActivityAgg(
            workspaceId,
            userId,
            dayStart,
            dayEnd,
            user.region as string
        );

        const hours = Array.from({ length: 24 }, (_, i) => ({
            hour: i + 1,
            count: 0,
            tasks: []
        }));

        for (const item of data) {
            hours[item.hour - 1] = item;
        }

        return hours;
    }
}
