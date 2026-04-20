// lib/api/profile.ts
import {
  GetProfileActivityAnalyticsRequest,
  GetProfileActivityAnalyticsResponse,
  GetUserProfileRequestType,
  UpdateProfileRequestType,
  UpdateProfileResponseType,
} from '@/types/profile.type'
import API from '../axios-client'
import {
  GetWorkspaceAnalyticsRequest,
  GetWorkspaceAnalyticsResponse,
} from '@/types/analytics.type'

// تابع اصلی برای به‌روزرسانی پروفایل
export const updateProfileMutationFn = async (
  data: UpdateProfileRequestType | FormData
): Promise<UpdateProfileResponseType> => {
  const response = await API.patch('/user/update', data)
  return response.data
}

export const getUserProfileMutationFn = async (
  data: GetUserProfileRequestType
): Promise<UpdateProfileResponseType> => {
  const baseUrl = `user/profile`
  const queryParams = new URLSearchParams()
  queryParams.append('username', data.username || '')
  queryParams.append('workspaceId', data.workspaceId || '')
  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl

  const response = await API.get(url)
  return response.data
}

// دریافت آنالیتیکس اکتیویتی پروفایل
export const getProfileActivityAnalyticsQueryFn = async (
  params: GetProfileActivityAnalyticsRequest
): Promise<GetProfileActivityAnalyticsResponse> => {
  const { workspaceId, date, projectId, userId } = params

  const searchParams = new URLSearchParams()

  searchParams.append('workspaceId', workspaceId)
  searchParams.append('date', date)
  searchParams.append('userId', userId)
  projectId && searchParams.append('projectId', projectId)

  const url = `/analytics/profile/activity?${searchParams.toString()}`

  const response = await API.get(url)

  return response.data
}

/* ======  🔹🔹🔹  API جدید Analytics Workspace  🔹🔹🔹  ====== */

export const getWorkspaceAnalyticsQueryFn = async (
  params: GetWorkspaceAnalyticsRequest
): Promise<GetWorkspaceAnalyticsResponse> => {
  const { workspaceId, type = 'all', treandRange = 5, projectId } = params

  const searchParams = new URLSearchParams()

  searchParams.append('type', type)
  searchParams.append('treandRange', String(treandRange))
  projectId && searchParams.append('projectId', String(projectId))

  const url = `/analytics/workspace/${workspaceId}?${searchParams.toString()}`

  const response = await API.get(url)

  return response.data
}
