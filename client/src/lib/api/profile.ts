import {
  GetUserProfileRequestType,
  UpdateProfileRequestType,
  UpdateProfileResponseType,
} from '@/types/profile.type'
import API from '../axios-client'

// تابع اصلی برای به‌روزرسانی پروفایل
export const updateProfileMutationFn = async (
  data: UpdateProfileRequestType,
): Promise<UpdateProfileResponseType> => {
  const response = await API.patch('/user/update', data)
  return response.data
}
export const getUserProfileMutationFn = async (
  data: GetUserProfileRequestType,
): Promise<UpdateProfileResponseType> => {
  const baseUrl = `user/profile`
  const queryParams = new URLSearchParams()
  queryParams.append('username', data.username || '')
  queryParams.append('workspaceId', data.workspaceId || '')
  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl

  const response = await API.get(url)
  return response.data
}
