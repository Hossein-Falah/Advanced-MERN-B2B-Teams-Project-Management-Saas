import { FilterQuery, Model } from "mongoose";
import { TaskDocument } from "../../models/task.model";
import { TaskStatusEnum } from "../../enums/task.enum";
import { calculateTrendFromChart } from "./helper/analytics.helper";

export class AnalyticsRepository {
    constructor(private taskModel: Model<TaskDocument>) { }

    private async getStats(
        filter: FilterQuery<TaskDocument>,
        dateField: string,
        trendRange: number
    ) {
        const { startOfToday, pastRangeStart } = this.getDateRanges(trendRange);

        const [stats, chart] = await Promise.all([
            this.taskModel.aggregate([
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

                        total: { $sum: 1 },

                        today: {
                            $sum: {
                                $cond: [
                                    { $gte: [`$${dateField}`, startOfToday] },
                                    1,
                                    0
                                ]
                            }
                        },

                        pastRange: {
                            $sum: {
                                $cond: [
                                    { $lt: [`$${dateField}`, startOfToday] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            this.getDailyChart(filter, trendRange, dateField)
        ]);

        const result = stats[0] || { today: 0, total: 0, pastRange: 0 };

        return {
            value: result.today,
            total: result.total,
            trend: calculateTrendFromChart(chart),
            chartData: chart
        };
    }

    async getCreatedStats(filter: FilterQuery<TaskDocument>, trendRange: number) {
        return this.getStats(filter, "createdAt", trendRange);
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

    async getInProgressStats(filter: FilterQuery<TaskDocument>) {
        const value = await this.taskModel.countDocuments({
            ...filter,
            status: {
                $in: [TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.IN_REVIEW]
            }
        });

        return {
            value,
            trend: 0,
            chartData: []
        };
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

    async getDailyChart(filter: FilterQuery<TaskDocument>, trendRange: number, dateField: string) {
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

        const map = new Map(data.map(d => [d._id, d.count]));

        const result: number[] = [];

        for (let i = trendRange - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000)
                .toISOString()
                .slice(0, 10);

            result.push(map.get(date) || 0);
        }

        return result;
    }

    private getDateRanges(trendRange: number) {
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const pastRangeStart = new Date(startOfToday.getTime() - trendRange * 86400000);

        return { now, startOfToday, pastRangeStart };
    }
}
