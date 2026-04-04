// profile.type.ts
import { UserType } from './api.type'

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

export interface UpdateProfileResponseType {
  message: string
  user: UserType
}

export interface GetUserProfileRequestType {
  workspaceId: string
  username?: string
  email?: string
  phone?: string
  id?: string
}
