// src/types/automation.type.ts

// انواع اتوماسیون
export enum AutomationType {
  SCHEDULED = 'SCHEDULED', // زمان‌بندی شده
  TRIGGER_BASED = 'TRIGGER_BASED', // مبتنی بر تریگر
  CONDITIONAL = 'CONDITIONAL', // شرطی
  WEBHOOK = 'WEBHOOK', // وب‌هوک
  EMAIL = 'EMAIL', // ایمیل
  SMS = 'SMS', // پیامک
  DATA_SYNC = 'DATA_SYNC', // همگام‌سازی داده
  REPORT_GENERATION = 'REPORT_GENERATION', // تولید گزارش
  BACKUP = 'BACKUP', // پشتیبان‌گیری
  CLEANUP = 'CLEANUP', // پاک‌سازی
  NOTIFICATION = 'NOTIFICATION', // نوتیفیکیشن
  APPROVAL_WORKFLOW = 'APPROVAL_WORKFLOW',
}
// درخواست‌ها (Requests)
export interface GetAllAutomationsRequest {
  page?: number
  limit?: number
  type?: string
  status?: string
}

export interface CreateAutomationRequest {
  name: string
  type: AutomationType
  config: Record<string, any>
  isActive?: boolean
}

export interface UpdateAutomationRequest {
  id: string
  name?: string
  config?: Record<string, any>
  isActive?: boolean
}

export interface DeleteAutomationRequest {
  id: string
}

export interface ToggleAutomationRequest {
  id: string
}

// پاسخ‌ها (Responses)
export interface AutomationItem {
  id: string
  name: string
  type: AutomationType
  config: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GetAllAutomationsResponse {
  data: AutomationItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface GetSingleAutomationResponse {
  data: AutomationItem
}

export interface CreateAutomationResponse {
  data: AutomationItem
  message: string
}

export interface UpdateAutomationResponse {
  data: AutomationItem
  message: string
}

export interface DeleteAutomationResponse {
  message: string
}

export interface ToggleAutomationResponse {
  data: AutomationItem
  message: string
}
