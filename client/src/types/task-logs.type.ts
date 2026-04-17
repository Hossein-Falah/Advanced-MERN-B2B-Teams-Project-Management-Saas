import { TaskType, UserType } from './api.type'
import { ResponseType } from './api.type'

export type LogActionEnum = 'CREATE' | 'UPDATE' | 'DELETE'

export type TaskLogChangeType = {
  _id: string
  field: Partial<keyof TaskType>
  oldValue?: string | null
  newValue?: string | null
}

export type TaskLogType = {
  _id: string
  task: string
  workspace: string
  user: UserType
  action: LogActionEnum
  isUndone: boolean
  changes: TaskLogChangeType[]
  createdAt: string
}

// پجینیشن حذف شد؛ مدیریت پجینیشن فقط در خود ResponseType انجام می‌شود
export type AllTaskLogsResponseType = ResponseType<{
  logs: TaskLogType[]
}>

export type GetAllTaskLogsParamsType = {
  taskId: string
}

export type LogsListProps = {
  logs: TaskLogType[]
  selectedLogId?: string | null
  onSelectLog: (log: TaskLogType) => void
  isLoading?: boolean
}

export type LogDetailsProps = {
  log: TaskLogType | null
  task: TaskType & Record<string, any>
  onUndo: (logId: string) => void
  onRedo: (logId: string) => void
  isUndoLoading?: boolean
  isRedoLoading?: boolean
}
