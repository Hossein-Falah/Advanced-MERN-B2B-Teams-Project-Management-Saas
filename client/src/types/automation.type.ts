// src/types/automation.type.ts

import { TaskType, ResponseType } from './api.type'

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
  taskId?: TaskType
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

export type UpdateAutomationRequest = Partial<CreateAutomationRequest> & {}

export interface UpdateAutomationApiRequest {
  workspaceId: string
  automationId: string
  data: UpdateAutomationRequest
}

export interface DeleteAutomationRequest {
  workspaceId: string
  automationId: string
}

// --------------------
// Responses (همه extend از ResponseType)
// --------------------

export type GetAllAutomationsResponse = ResponseType<{
  automations: AutomationItem[]
}>

export type GetSingleAutomationResponse = ResponseType<{
  automation: AutomationItem
}>

export type DeleteAutomationResponse = ResponseType<{
  message: string
}>

export type ToggleAutomationResponse = ResponseType<{
  automation: AutomationItem
}>

/**
 * نوع داده اتوماسیون برای این فرم ادیت
 * این را با تایپ واقعی‌ات هماهنگ کن
 */
export type AutomationEditType = {
  _id: string
  type: AutomationType
  taskId: string | { _id: string }
  daysOfWeek: number[]
  timeOfDay: string // "HH:mm"
  timezone: string
  active: boolean
  startDate?: string | Date
}
