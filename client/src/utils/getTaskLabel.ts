import {
  TASK_STATUS_I18N_KEYS,
  TASK_PRIORITY_I18N_KEYS,
  TaskPriorityEnumType,
  TaskStatusEnumType,
} from '../constant/task'

export const getTaskStatusLabels = (t: any) => {
  return Object.fromEntries(
    Object.entries(TASK_STATUS_I18N_KEYS).map(([key, value]) => [key, t(value)])
  ) as Record<TaskStatusEnumType, string>
}

export const getTaskPriorityLabels = (t: any) => {
  return Object.fromEntries(
    Object.entries(TASK_PRIORITY_I18N_KEYS).map(([key, value]) => [
      key,
      t(value),
    ])
  ) as Record<TaskPriorityEnumType, string>
}
