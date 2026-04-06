import { Model } from "mongoose";
import { TaskDocument } from "../../models/task.model";
import { TaskStatusEnum } from "../../enums/task.enum";
import { calculateTrend } from "./helper/analytics.helper";

export class AnalyticsRepository {
    constructor(private taskModel: Model<TaskDocument>) { }

    async getCreatedStats(filter: any, treandRange: number) {
        const now = new Date();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now.getTime() - treandRange * 86400000);
        const startOfPrevWeek = new Date(now.getTime() - treandRange * 2 * 86400000);

        const [todayCount, currentWeek, previousWeek, chart] = await Promise.all([
            this.taskModel.countDocuments({
                ...filter,
                createdAt: { $gte: startOfToday }
            }),

            this.taskModel.countDocuments({
                ...filter,
                createdAt: { $gte: startOfWeek }
            }),

            this.taskModel.countDocuments({
                ...filter,
                createdAt: { $gte: startOfPrevWeek, $lt: startOfWeek }
            }),

            this.getDailyChart(filter, treandRange, "createdAt")
        ]);

        return {
            value: todayCount,
            trend: calculateTrend(currentWeek, previousWeek),
            chartData: chart
        };
    }

    async getCompletedStats(filter: any, treandRange: number) {
        const now = new Date();
        const currentStart = new Date(now.getTime() - treandRange * 86400000);
        const previousStart = new Date(now.getTime() - treandRange * 2 * 86400000);

        const [count, current, previous, chart] = await Promise.all([
            this.taskModel.countDocuments({
                ...filter,
                status: TaskStatusEnum.DONE,
            }),

            this.taskModel.countDocuments({
                ...filter,
                status: TaskStatusEnum.DONE,
                updatedAt: { $gte: currentStart }
            }),

            this.taskModel.countDocuments({
                ...filter,
                status: TaskStatusEnum.DONE,
                updatedAt: { $gte: previousStart, $lt: currentStart }
            }),

            this.getDailyChart(
                { ...filter, status: TaskStatusEnum.DONE },
                treandRange,
                "updatedAt"
            )
        ]);

        return {
            value: count,
            trend: calculateTrend(current, previous),
            chartData: chart
        };
    }

    async getInProgressStats(filter: any, treandRange: number) {
        const now = new Date();
        const currentStart = new Date(now.getTime() - treandRange * 86400000);
        const previousStart = new Date(now.getTime() - treandRange * 2 * 86400000);

        const statusFilter = {
            ...filter,
            status: { $in: [TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.IN_REVIEW] }
        };

        const [value, current, previous, chart] = await Promise.all([
            this.taskModel.countDocuments(statusFilter),

            this.taskModel.countDocuments({
                ...statusFilter,
                updatedAt: { $gte: currentStart }
            }),

            this.taskModel.countDocuments({
                ...statusFilter,
                updatedAt: { $gte: previousStart, $lt: currentStart }
            }),

            this.getDailyChart(statusFilter, treandRange, "updatedAt")
        ]);

        return {
            value: value,
            trend: calculateTrend(current, previous),
            chartData: chart
        };
    }

    async getOverdueStats(filter: any, treandRange: number) {
        const now = new Date();
        const currentStart = new Date(now.getTime() - treandRange * 86400000);
        const previousStart = new Date(now.getTime() - treandRange * 2 * 86400000);

        const overdueFilter = {
            ...filter,
            dueDate: { $lt: new Date() },
            status: { $ne: TaskStatusEnum.DONE }
        };

        const [value, current, previous, chart] = await Promise.all([
            this.taskModel.countDocuments(overdueFilter),


            this.taskModel.countDocuments({
                ...overdueFilter,
                dueDate: { $gte: currentStart, $lt: new Date() }
            }),

            this.taskModel.countDocuments({
                ...filter,
                dueDate: { $gte: previousStart, $lt: currentStart },
                status: { $ne: TaskStatusEnum.DONE }
            }),

            this.getDailyChart(overdueFilter, treandRange, "dueDate")
        ]);

        return {
            value: value,
            trend: calculateTrend(current, previous),
            chartData: chart
        };
    }

    async getDailyChart(filter: any, treandRange: number, dateField: string) {
        const start = new Date(Date.now() - treandRange * 86400000);

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
                        day: { $dayOfYear: `$${dateField}` },
                        year: { $year: `$${dateField}` }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const map = new Map();

        data.forEach(d => {
            map.set(`${d._id.year}-${d._id.day}`, d.count);
        });

        const result: number[] = [];

        for (let i = treandRange - 1; i >= 0; i--) {

            const date = new Date(Date.now() - i * 86400000);

            const key =
                `${date.getFullYear()}-${Math.floor(
                    (date.getTime() -
                        new Date(date.getFullYear(), 0, 0).getTime()) /
                    86400000
                )}`;

            result.push(map.get(key) || 0);
        }

        return result;
    }
}
