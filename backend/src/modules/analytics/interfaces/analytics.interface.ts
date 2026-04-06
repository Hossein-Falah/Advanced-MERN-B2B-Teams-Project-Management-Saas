export interface AnalyticsMetric {
    value: number;
    trend: number;
    chartData: number[];
}

export interface AnalyticsGroup {
    todayTasks: AnalyticsMetric;
    overdueTasks: AnalyticsMetric;
    completedTasks: AnalyticsMetric;
    inProgressTasks: AnalyticsMetric;
}

export interface AnalyticsResponse {
    analytics: {
        team?: AnalyticsGroup;
        personal?: AnalyticsGroup;
    };
}
