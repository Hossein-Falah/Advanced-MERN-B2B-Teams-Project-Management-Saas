// src/types/notification.type.ts

import { CommentType, TaskType, UserType } from './api.type'

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

export interface NotificationPagination {
  total: number
  page: number
  limit: number
  pages: number
}

export interface GetAllNotificationsResponse {
  message: string
  notifications: {
    notifications: NotificationItem[]
    unreadCount: number
    pagination: NotificationPagination
  }
}

// اگر لازم شد برای گرفتن با page/limit پارامتر بفرستی:
export interface GetAllNotificationsRequest {
  page?: number
  limit?: number
}

// read-all هیچ bodyای نداره، فقط response داره
export interface ReadAllNotificationsResponse {
  message: string
}

// read/:notificationId
export interface ReadSingleNotificationRequest {
  notificationId: string
}

export interface ReadSingleNotificationResponse {
  message: string
  notification: NotificationItem
}
