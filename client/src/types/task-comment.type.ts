import { ResponseType } from './api.type'

export type MentionableUsersType = {
  _id: string
  username: string
}

// ریسپانس بدون پجینیشن داخلی — پجینیشن فقط داخل ResponseType
export type AllMentionableUsersResponseType = ResponseType<{
  users: MentionableUsersType[]
}>

export type GetAllMentionableUsersParamsType = {
  workspaceId: string
  query: string
}
