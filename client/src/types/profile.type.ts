// src/types/profile.type.ts
import { TaskType, UserType, ResponseType } from './api.type'

// تایپ‌های جدید برای فیلدهای اضافه‌شده

export interface WorkScheduleType {
  workingDays: number[] // مثلا [1,2,3,4,5] => دوشنبه تا جمعه (بسته به منطق بک‌اندت)
  startHour: number // 9
  endHour: number // 18
}

export interface NotifConditionsType {
  onCreateTask: boolean
  onUpdateTask: boolean
  onMention: boolean
  onAutomationAction: boolean
  onMessage: boolean
}

export interface SmsConditionsType {
  onCreateTask: boolean
  onUpdateTask: boolean
  onMention: boolean
  onAutomationAction: boolean
  onMessage: boolean
}

// تایپ‌های مربوط به به‌روزرسانی پروفایل

export interface UpdateProfileRequestType {
  name?: string
  email?: string
  phone?: string
  bio?: string
  jobTitle?: string
  username?: string
  profilePicture?: string
  workSchedule?: WorkScheduleType
  notifConditions?: NotifConditionsType
  smsConditions?: SmsConditionsType
  region?: string
}

// ✅ هماهنگ با ResponseType
export type UpdateProfileResponseType = ResponseType<{
  user: UserType
}>

export interface GetUserProfileRequestType {
  workspaceId: string
  username?: string
  email?: string
  phone?: string
  id?: string
}

// درخواست گرفتن اکتیویتی پروفایل
export interface GetProfileActivityAnalyticsRequest {
  workspaceId: string
  date: string // مثال: "2026-04-06"
  userId: string
  projectId?: string
}

// یک آیتم اکتیویتی در یک ساعت مشخص
export interface ProfileActivityItem {
  tasks: TaskType[]
  count: number
  hour: number // 1 تا 24
}

// ✅ پاسخ API (روی ResponseType پیچیده شد)
export type GetProfileActivityAnalyticsResponse = ResponseType<{
  analytics: ProfileActivityItem[]
}>
