// src/types/notification.type.ts

import { CommentType, TaskType, UserType, ResponseType } from './api.type'

export type NotificationType = 'TASK_ASSIGNED' | 'MENTION'

export interface NotificationItem {
  _id: string
  type: NotificationType
  receiver: UserType
  sender: UserType
  task: TaskType
  comment: CommentType
  workspace: string
  read: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

// اگر همچنان نیاز داری در ResponseType استفاده کنی می‌تونی این رو نگه داری
export interface NotificationPagination {
  total: number
  page: number
  limit: number
  pages: number
}

// ================= Responses (همه بر پایه ResponseType) =================
// پجینیشن از اینجا حذف شد و قرار است داخل خود ResponseType مدیریت شود

export type GetAllNotificationsResponse = ResponseType<{
  notifications: NotificationItem[]
  unreadCount: number
}>

// اگر لازم شد برای گرفتن با page/limit پارامتر بفرستی:
export interface GetAllNotificationsRequest {
  page?: number
  limit?: number
}

// read-all هیچ body‌ای نداره، فقط response داره
export type ReadAllNotificationsResponse = ResponseType<{
  message: string
}>

// read/:notificationId
export interface ReadSingleNotificationRequest {
  notificationId: string
}

export type ReadSingleNotificationResponse = ResponseType<{
  notification: NotificationItem
}>
