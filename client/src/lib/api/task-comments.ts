import {
  AllMentionableUsersResponseType,
  GetAllMentionableUsersParamsType,
} from '@/types/task-comment.type'
import API from '../axios-client'

export const getAllMentionableUsersQueryFn = async ({
  workspaceId,
  query,
}: GetAllMentionableUsersParamsType): Promise<AllMentionableUsersResponseType> => {
  const baseUrl = `/mention/workspace/${workspaceId}`
  const queryParams = new URLSearchParams()
  queryParams.append('query', query)
  queryParams.append('pageSize', '99999')
  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl

  const response = await API.get(url)
  return response.data
}
