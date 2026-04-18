import { DateTime } from "luxon";
import { FilterQuery } from "mongoose";

import { toObjectId } from "../../utils/convert-objectId.util";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsGroup } from "./interfaces/analytics.interface";
import { AnalyticsType } from "./types/analytics.type";
import { TaskDocument } from "../task/task.model";
import { UserService } from "../user/user.service";
import { AnalyticsTaskTypeEnum } from "../../common/enums/analytics.enum";
import { validateDateTask } from "../../utils/validate-task.util";
import { generateDateRange } from "../../utils/date-fill-gap.util";

export class AnalyticsService {
    constructor(
        private analyticsRepository: AnalyticsRepository,
        private userService: UserService
    ) { }

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
            this.analyticsRepository.getTodayTasksStats(filter, treandRange),
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
        const user = await this.userService.getUserById(userId);

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

        return {
            analytics: hours
        }
    }

    public async getTaskAnalytics(
        workspaceId: string,
        type: AnalyticsTaskTypeEnum,
        startDate: Date,
        endDate: Date,
        projectId?: string
    ) {
        validateDateTask(startDate, endDate);
    
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
            
        const tasksDaily =
            type === AnalyticsTaskTypeEnum.CREATED
                ? await this.analyticsRepository.getTasksCreatedDaily(workspaceId, start, end, projectId)
                : await this.analyticsRepository.getTasksCompletedDaily(workspaceId, start, end, projectId);
                
        const allDates = generateDateRange(start, end);

        const map = new Map(tasksDaily.map(t => [t.date, t.count]));

        const filled = allDates.map(date => ({
            date,
            count: map.get(date) ?? 0
        }));

        return filled;
    }

    public async getProjectAnalytics(workspaceId: string) {
        const getProjects = await this.analyticsRepository.getProjectsProgress(workspaceId);
        return getProjects;
    }

    public async getUserAnalytics(
        workspaceId: string, 
        startDate: Date, 
        endDate: Date
    ) {
        validateDateTask(startDate, endDate);
    
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    
        const getAnalytics = await this.analyticsRepository.getUsersAssignedCount(workspaceId, start, end);
        return getAnalytics;
    }
}
