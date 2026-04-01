import { PaginationType } from './api.type'

export type MentionableUsersType = {
  _id: string
  username: string
}

export type AllMentionableUsersResponseType = {
  message: string
  mention: {
    users: MentionableUsersType[]
    pagination: PaginationType
  }
}
export type GetAllMentionableUsersParamsType = {
  workspaceId: string
  query: string
}
