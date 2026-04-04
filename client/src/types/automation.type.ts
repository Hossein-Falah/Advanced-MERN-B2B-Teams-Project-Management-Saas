// src/types/automation.type.ts

// انواع اتوماسیون
export enum AutomationType {
  TASK_REPETITION = 'TASK_REPETITION',
  SCHEDULED = 'SCHEDULED',
  TRIGGER_BASED = 'TRIGGER_BASED',
}

// ساختار اصلی یک اتوماسیون
export interface AutomationItem {
  _id: string
  type: AutomationType
  taskId: string
  daysOfWeek: number[]
  timeOfDay: string
  timezone: string
  nextRunAt: string
  active: boolean
  createdAt: string
  updatedAt: string
  __v: number
  lastRunAt?: string
}

// --------------------
// Requests
// --------------------

export interface GetAllAutomationsRequest {
  workspaceId: string
  page?: number
  limit?: number
}

export interface CreateAutomationRequest {
  type: AutomationType
  taskId: string
  daysOfWeek: number[]
  timeOfDay: string
  timezone: string
  active?: boolean
}

export interface CreateAutomationApiRequest {
  workspaceId: string
  data: CreateAutomationRequest
}

export type UpdateAutomationRequest = Partial<CreateAutomationRequest> & {
  id: string
}

export interface UpdateAutomationApiRequest {
  workspaceId: string
  data: UpdateAutomationRequest
}

export interface DeleteAutomationRequest {
  workspaceId: string
  id: string
}

// --------------------
// Responses
// --------------------

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

export interface GetAllAutomationsResponse {
  data: AutomationItem[]
  pagination: PaginationInfo
}

export type GetSingleAutomationResponse = AutomationItem

export interface DeleteAutomationResponse {
  message: string
}

export interface ToggleAutomationResponse {
  message: string
  data: AutomationItem
}
