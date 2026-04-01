// src/hooks/use-notifications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllNotificationsQueryFn,
  readAllNotificationsMutationFn,
  readSingleNotificationMutationFn,
} from '@/lib/api/notification'
import {
  GetAllNotificationsRequest,
  GetAllNotificationsResponse,
  ReadSingleNotificationRequest,
} from '@/types/notification.type'

const NOTIFICATIONS_QUERY_KEY = ['notifications']

export const useNotifications = (params?: GetAllNotificationsRequest) => {
  return useQuery<GetAllNotificationsResponse>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => getAllNotificationsQueryFn(params),
  })
}

export const useReadAllNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: readAllNotificationsMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })
}

export const useReadSingleNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReadSingleNotificationRequest) =>
      readSingleNotificationMutationFn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })
}
