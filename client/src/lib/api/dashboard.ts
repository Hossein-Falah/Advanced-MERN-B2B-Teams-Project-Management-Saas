// lib/api/profile.ts
import {
  GetWorkspaceAnalyticsRequest,
  GetWorkspaceAnalyticsResponse,
} from '@/types/profile.type'
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
