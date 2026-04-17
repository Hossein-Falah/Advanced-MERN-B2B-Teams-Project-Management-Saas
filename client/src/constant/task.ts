export const TaskStatusEnum = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const

export const TaskPriorityEnum = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const
export type TaskStatusEnumType = keyof typeof TaskStatusEnum
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum

export const TASK_STATUS_I18N_KEYS: Record<TaskStatusEnumType, string> = {
  BACKLOG: 'tasks.status.BACKLOG',
  TODO: 'tasks.status.TODO',
  IN_PROGRESS: 'tasks.status.IN_PROGRESS',
  IN_REVIEW: 'tasks.status.IN_REVIEW',
  DONE: 'tasks.status.DONE',
}

export const TASK_PRIORITY_I18N_KEYS: Record<TaskPriorityEnumType, string> = {
  LOW: 'tasks.priority.LOW',
  MEDIUM: 'tasks.priority.MEDIUM',
  HIGH: 'tasks.priority.HIGH',
  URGENT: 'tasks.priority.URGENT',
}
