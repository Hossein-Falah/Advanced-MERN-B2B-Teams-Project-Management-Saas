import { FilterQuery, Model } from "mongoose";
import { TaskStatusEnum } from "../../common/enums/task.enum";
import { toObjectId } from "../../utils/convert-objectId.util";
import { TaskDocument } from "../task/task.model";
import { calculateTrendFromChart } from "./helper/analytics.helper";

export class AnalyticsRepository {
    constructor(private taskModel: Model<TaskDocument>) { }

    private getDateRanges(days: number) {
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const pastRangeStart = new Date(startOfToday);
        pastRangeStart.setDate(pastRangeStart.getDate() - days);

        return { now, startOfToday, pastRangeStart };
    }

    private async getStats(
        filter: FilterQuery<TaskDocument>,
        dateField: string,
        trendRange: number
    ) {
        const { startOfToday, pastRangeStart } = this.getDateRanges(trendRange);

        const totalPromise = this.taskModel.countDocuments(filter);

        const statsPromise = this.taskModel.aggregate([
            {
                $match: {
                    ...filter,
                    [dateField]: {
                        $gte: pastRangeStart,
                        $lt: new Date()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    today: {
                        $sum: {
                            $cond: [
                                { $gte: [`$${dateField}`, startOfToday] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const chartPromise = this.getDailyChart(
            filter,
            trendRange,
            dateField
        );

        const [stats, chart, total] = await Promise.all([
            statsPromise,
            chartPromise,
            totalPromise
        ]);

        const today = chart.length ? chart[chart.length - 1] : 0;
        const trend = calculateTrendFromChart(chart, trendRange);

        return {
            value: stats[0]?.today ?? 0,
            total,
            trend,
            chartData: chart
        };
    }


    async getTodayTasksStats(filter: FilterQuery<TaskDocument>, trendRange: number) {
        return this.getStats(filter, "startDate", trendRange);
    }

    async getCompletedStats(filter: FilterQuery<TaskDocument>, trendRange: number) {
        return this.getStats(
            {
                ...filter,
                status: TaskStatusEnum.DONE
            },
            "updatedAt",
            trendRange
        );
    }

    async getOverdueStats(filter: FilterQuery<TaskDocument>, trendRange: number) {
        const now = new Date();

        return this.getStats(
            {
                ...filter,
                status: { $ne: TaskStatusEnum.DONE },
                dueDate: { $lte: now }
            },
            "dueDate",
            trendRange
        );
    }

    async getInProgressStats(filter: FilterQuery<TaskDocument>) {
        const value = await this.taskModel.countDocuments({
            ...filter,
            status: {
                $in: [TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.IN_REVIEW]
            }
        });

        return { value, trend: 0, chartData: [] };
    }

    async getDailyChart(
        filter: FilterQuery<TaskDocument>,
        trendRange: number,
        dateField: string
    ) {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - trendRange);
        start.setHours(0, 0, 0, 0);

        const data = await this.taskModel.aggregate([
            {
                $match: {
                    ...filter,
                    [dateField]: { $gte: start }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: `$${dateField}`
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const map = new Map(data.map(i => [i._id, i.count]));
        const result: number[] = [];

        for (let i = trendRange - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000)
                .toISOString()
                .slice(0, 10);
            result.push(map.get(d) ?? 0);
        }

        return result;
    }

    public async getUserDailyActivityAgg(
        workspaceId: string,
        userId: string,
        dayStart: Date,
        dayEnd: Date,
        timezone: string
    ) {
        return this.taskModel.aggregate([
            {
                $match: {
                    workspace: toObjectId(workspaceId),
                    assignedTo: toObjectId(userId),
                    startDate: { $lte: dayEnd },
                    $or: [
                        { dueDate: { $gte: dayStart } },
                        { dueDate: null }
                    ]
                }
            },

            {
                $addFields: {
                    start: {
                        $cond: [
                            { $lt: ["$startDate", dayStart] },
                            dayStart,
                            "$startDate"
                        ]
                    },
                    end: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ["$dueDate", null] },
                                    { $gt: ["$dueDate", dayEnd] }
                                ]
                            },
                            dayEnd,
                            "$dueDate"
                        ]
                    }
                }
            },
            {
                $addFields: {
                    startHour: {
                        $hour: {
                            date: "$start",
                            timezone: timezone
                        }
                    },
                    endHour: {
                        $hour: {
                            date: "$end",
                            timezone: timezone
                        }
                    }
                }
            },

            {
                $addFields: {
                    hours: {
                        $range: [
                            "$startHour",
                            { $add: ["$endHour", 1] }
                        ]
                    }
                }
            },

            { $unwind: "$hours" },

            {
                $group: {
                    _id: "$hours",
                    tasks: {
                        $push: {
                            _id: "$_id",
                            title: "$title",
                            startDate: "$startDate",
                            dueDate: "$dueDate"
                        }
                    },
                    count: { $sum: 1 }
                }
            },

            {
                $project: {
                    _id: 0,
                    hour: { $add: ["$_id", 1] },
                    count: 1,
                    tasks: 1
                }
            },

            {
                $sort: { hour: 1 }
            }
        ]);
    }

    async getTasksCreatedDaily(
        workspaceId: string,
        startDate: Date,
        endDate: Date,
        projectId?: string
    ) {        
        const match: FilterQuery<TaskDocument> = {
            workspace: toObjectId(workspaceId),
            createdAt: { $gte: startDate, $lte: endDate },
            ...(projectId && { project: toObjectId(projectId) })
        };        

        return this.taskModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", count: 1, _id: 0 } }
        ]);
    }

    async getTasksCompletedDaily(
        workspaceId: string,
        startDate: Date,
        endDate: Date,
        projectId?: string
    ): Promise<{ date: string; count: number }[]> {
        const match: FilterQuery<TaskDocument> = {
            workspace: toObjectId(workspaceId),
            status: TaskStatusEnum.DONE,
            updatedAt: { $gte: startDate, $lte: endDate },
            ...(projectId && { project: toObjectId(projectId) })
        };
        
        const aggregation = await this.taskModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { date: "$_id", count: 1, _id: 0 } },
        ]);
        return aggregation;
    }


    async getProjectsProgress(workspaceId: string): Promise<any[]> {
        const aggregation = await this.taskModel.aggregate([
            { $match: { workspace: toObjectId(workspaceId) } },
            {
                $group: {
                    _id: "$project",
                    total_tasks: { $sum: 1 },
                    completed_tasks: {
                        $sum: { $cond: [{ $eq: ["$status", TaskStatusEnum.DONE] }, 1, 0] },
                    },
                },
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectInfo",
                },
            },
            { $unwind: { path: "$projectInfo", preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    project_id: "$_id",
                    project_name: "$projectInfo.name",
                    total_tasks: 1,
                    completed_tasks: 1,
                    progress_percent: {
                        $round: [
                            {
                                $cond: [
                                    { $eq: ["$total_tasks", 0] },
                                    0,
                                    { $multiply: [{ $divide: ["$completed_tasks", "$total_tasks"] }, 100] }
                                ]
                            },
                            2
                        ]
                    },
                },
            },
            { $sort: { project_name: 1 } },
        ]);
        return aggregation;
    }

    async getUsersAssignedCount(
        workspaceId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any[]> {
        const aggregation = await this.taskModel.aggregate([
            {
                $match: {
                    workspace: toObjectId(workspaceId),
                    assignedTo: { $ne: null },
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$assignedTo",
                    assigned_count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
            { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    user_id: "$_id",
                    user_name: "$userInfo.name",
                    assigned_count: 1,
                    _id: 0,
                },
            },
            { $sort: { assigned_count: -1 } },
        ]);
        return aggregation;
    }
}
