// lib/api/profile.ts
import {
  GetWorkspaceAnalyticsRequest,
  GetWorkspaceAnalyticsResponse,
  GetWorkspaceProjectsAnalyticsRequest,
  GetWorkspaceProjectsAnalyticsResponse,
  GetWorkspaceTasksAnalyticsRequest,
  GetWorkspaceTasksAnalyticsResponse,
  GetWorkspaceUsersAnalyticsRequest,
  GetWorkspaceUsersAnalyticsResponse,
} from '@/types/analytics.type'
import API from '../axios-client'

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

/* ======  🔹🔹🔹  API User Analytics Workspace  🔹🔹🔹  ====== */

export const getWorkspaceUsersAnalyticsQueryFn = async (
  params: GetWorkspaceUsersAnalyticsRequest
): Promise<GetWorkspaceUsersAnalyticsResponse> => {
  const { workspaceId, start_date, end_date } = params

  const searchParams = new URLSearchParams()
  searchParams.append('start_date', start_date)
  searchParams.append('end_date', end_date)

  const url = `/analytics/users/workspace/${workspaceId}?${searchParams.toString()}`

  const response = await API.get(url)

  return response.data
}

export const getWorkspaceProjectsAnalyticsQueryFn = async (
  params: GetWorkspaceProjectsAnalyticsRequest
): Promise<GetWorkspaceProjectsAnalyticsResponse> => {
  const { workspaceId } = params
  const url = `/analytics/projects/workspace/${workspaceId}`

  const response = await API.get(url)
  return response.data
}

export const getWorkspaceTasksAnalyticsQueryFn = async (
  params: GetWorkspaceTasksAnalyticsRequest
): Promise<GetWorkspaceTasksAnalyticsResponse> => {
  const { workspaceId, start_date, end_date, type, projectId } = params

  const searchParams = new URLSearchParams()
  searchParams.append('start_date', start_date)
  searchParams.append('end_date', end_date)

  if (type) {
    searchParams.append('type', type)
  }

  if (projectId) {
    searchParams.append('projectId', projectId)
  }

  const url = `/analytics/tasks/workspace/${workspaceId}?${searchParams.toString()}`

  const response = await API.get(url)

  return response.data
}
