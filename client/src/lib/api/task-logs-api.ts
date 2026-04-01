import {
  AllTaskLogsResponseType,
  GetAllTaskLogsParamsType,
} from '@/types/task-logs.type'
import API from '../axios-client'

export const getAllTaskLogsQueryFn = async ({
  taskId,
}: GetAllTaskLogsParamsType): Promise<AllTaskLogsResponseType> => {
  const baseUrl = `log/task/${taskId}`
  const queryParams = new URLSearchParams()
  queryParams.append('pageSize', '99999')

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl

  const response = await API.get(url)
  return response.data
}

export const undoTaskLog = async ({
  logId,
  taskId,
  workspaceId,
}: {
  logId: string
  workspaceId: string
  taskId: string
}) => {
  const { data } = await API.post(
    `/task/workspace/${workspaceId}/undo/${taskId}/log/${logId}`,
  )
  return data
}

export const redoTaskLog = async ({
  logId,
  taskId,
  workspaceId,
}: {
  logId: string
  workspaceId: string
  taskId: string
}) => {
  const { data } = await API.post(
    `/task/workspace/${workspaceId}/redo/${taskId}/log/${logId}`,
  )
  return data
}
