import { UserType } from './api.type'

// تایپ‌های مربوط به به‌روزرسانی پروفایل
export interface UpdateProfileRequestType {
  name?: string
  email?: string
  phone?: string
  bio?: string
  jobTitle?: string
  username?: string
  profilePicture?: string
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
