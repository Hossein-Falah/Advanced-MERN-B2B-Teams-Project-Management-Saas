/* ======  🔹🔹🔹  API جدید Analytics Workspace  🔹🔹🔹  ====== */

import { ResponseType, UserType } from './api.type'

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
export type GetWorkspaceAnalyticsResponse = ResponseType<{
  analytics: WorkspaceAnalytics
}>

// درخواست API
export interface GetWorkspaceUsersAnalyticsRequest {
  workspaceId: string
  start_date: string // 'YYYY-MM-DD'
  end_date: string // 'YYYY-MM-DD'
}
export interface WorkspaceUserAnalyticsItem extends UserType {
  assigned_count: number
}
// پاسخ API
export type GetWorkspaceUsersAnalyticsResponse = ResponseType<{
  userAnalytics: WorkspaceUserAnalyticsItem[]
}>

// تایپ‌های مربوط به آنالیز پروژه‌ها
export interface ProjectAnalyticsItem {
  _id: string
  total_tasks: number
  completed_tasks: number
  project_id: string
  project_name: string
  progress_percent: number
}

// درخواست API برای دریافت آنالیز پروژه‌های ورک‌اسپیس
export interface GetWorkspaceProjectsAnalyticsRequest {
  workspaceId: string
}

// پاسخ API برای دریافت آنالیز پروژه‌ها
export type GetWorkspaceProjectsAnalyticsResponse = ResponseType<{
  projectAnalytics: ProjectAnalyticsItem[]
}>

export interface TaskAnalyticsItem {
  count: number
  date: string // 'YYYY-MM-DD'
}

export interface GetWorkspaceTasksAnalyticsRequest {
  workspaceId: string
  start_date: string // 'YYYY-MM-DD'
  end_date: string // 'YYYY-MM-DD'
  type?: 'created' | 'completed' | 'overdue' | 'in_progress'
  projectId?: string // اختیاری
}

// پاسخ API
export type GetWorkspaceTasksAnalyticsResponse = ResponseType<{
  taskAnalytics: TaskAnalyticsItem[]
}>
