/* ======  🔹🔹🔹  API جدید Analytics Workspace  🔹🔹🔹  ====== */

// امروز، دیرکرد، تکمیل‌شده، در حال انجام
export interface AnalyticsMetric {
  value: number
  total?: number
  trend: number
  chartData: number[]
}

// ساختار بخش team و personal
export interface AnalyticsGroup {
  todayTasks: AnalyticsMetric
  overdueTasks: AnalyticsMetric
  completedTasks: AnalyticsMetric
  inProgressTasks: AnalyticsMetric
}

// کل analytics
export interface WorkspaceAnalytics {
  team: AnalyticsGroup
  personal: AnalyticsGroup
}

// درخواست API
export interface GetWorkspaceAnalyticsRequest {
  workspaceId: string
  type?: 'all' | 'team' | 'personal' // بر اساس کوئری type=all
  projectId?: string
  treandRange?: number // طبق پارامتر treandRange=5
}

// پاسخ API
export interface GetWorkspaceAnalyticsResponse {
  analytics: WorkspaceAnalytics
}
