// src/services/automation.api.ts

import API from '../axios-client'
import {
  GetAllAutomationsRequest,
  GetAllAutomationsResponse,
  GetSingleAutomationResponse,
  DeleteAutomationResponse,
  DeleteAutomationRequest,
  CreateAutomationApiRequest,
  UpdateAutomationApiRequest,
} from '@/types/automation.type'

// دریافت همه اتوماسیون‌ها
export const getAllAutomationsQueryFn = async (
  params: GetAllAutomationsRequest
): Promise<GetAllAutomationsResponse> => {
  const { workspaceId, page, limit } = params

  const baseUrl = `/automation/workspace/${workspaceId}/all`
  const searchParams = new URLSearchParams()

  if (page !== undefined) searchParams.append('page', String(page))
  if (limit !== undefined) searchParams.append('limit', String(limit))

  const url = searchParams.toString() ? `${baseUrl}?${searchParams}` : baseUrl

  const response = await API.get(url)

  return response.data
}

// دریافت یک اتوماسیون
export const getAutomationByIdQueryFn = async (
  workspaceId: string,
  automationId: string
): Promise<GetSingleAutomationResponse> => {
  const response = await API.get(
    `/automation/workspace/${workspaceId}/getById/${automationId}`
  )

  return response.data
}

// ایجاد اتوماسیون
export const createAutomationMutationFn = async (
  payload: CreateAutomationApiRequest
): Promise<GetSingleAutomationResponse> => {
  const { workspaceId, data } = payload

  const response = await API.post(
    `/automation/workspace/${workspaceId}/create`,
    data
  )

  return response.data
}

// آپدیت اتوماسیون
export const updateAutomationMutationFn = async (
  payload: UpdateAutomationApiRequest
): Promise<GetSingleAutomationResponse> => {
  const { workspaceId, automationId, data } = payload
  const { ...updateFields } = data

  const response = await API.patch(
    `/automation/workspace/${workspaceId}/update/${automationId}`,
    updateFields
  )

  return response.data
}

// حذف اتوماسیون
export const deleteAutomationMutationFn = async (
  data: DeleteAutomationRequest
): Promise<DeleteAutomationResponse> => {
  const { workspaceId, automationId } = data

  const response = await API.delete(
    `/automation/workspace/${workspaceId}/delete/${automationId}`
  )

  return response.data
}
