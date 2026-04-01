// src/services/notification.api.ts

import API from '../axios-client'
import {
  GetAllNotificationsRequest,
  GetAllNotificationsResponse,
  ReadAllNotificationsResponse,
  ReadSingleNotificationRequest,
  ReadSingleNotificationResponse,
} from '@/types/notification.type'

// گرفتن همه نوتیفیکیشن‌ها
export const getAllNotificationsQueryFn = async (
  params?: GetAllNotificationsRequest,
): Promise<GetAllNotificationsResponse> => {
  const baseUrl = '/notification/all'
  const searchParams = new URLSearchParams()

  if (params?.page != null) searchParams.append('page', String(params.page))
  if (params?.limit != null) searchParams.append('limit', String(params.limit))

  const url = searchParams.toString() ? `${baseUrl}?${searchParams}` : baseUrl

  const response = await API.get(url)
  return response.data
}

// read-all (خواندن همه نوتیفیکیشن‌ها)
export const readAllNotificationsMutationFn =
  async (): Promise<ReadAllNotificationsResponse> => {
    const response = await API.post('/notification/read-all')
    return response.data
  }

// read/:notificationId (خواندن یک نوتیفیکیشن خاص)
export const readSingleNotificationMutationFn = async (
  data: ReadSingleNotificationRequest,
): Promise<ReadSingleNotificationResponse> => {
  const { notificationId } = data
  const response = await API.post(`/notification/read/${notificationId}`)
  return response.data
}
