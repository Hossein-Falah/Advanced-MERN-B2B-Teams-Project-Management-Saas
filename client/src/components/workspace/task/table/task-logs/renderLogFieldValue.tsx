// src/utils/renderLogFieldValue.tsx
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Badge } from '@/components/ui/badge'

import { formatStatusToEnum } from '@/lib/helper'
import { priorities, statuses } from '@/components/workspace/task/table/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { TaskType } from '@/types/api.type'
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from '@/constant/task'

// i18n
import { TFunction } from 'i18next'

export const getFieldLabelMap = (
  t: TFunction
): Partial<Record<keyof TaskType, string>> => ({
  title: t('tasks.taskLogs.fields.title'),
  description: t('tasks.taskLogs.fields.description'),
  status: t('tasks.taskLogs.fields.status'),
  priority: t('tasks.taskLogs.fields.priority'),
  dueDate: t('tasks.taskLogs.fields.dueDate'),
  assignedTo: t('tasks.taskLogs.fields.assignedTo'),
  attachment: t('tasks.taskLogs.fields.attachment'),
  startDate: t('tasks.taskLogs.fields.startDate'),
})

type RenderLogFieldValueOptions = {
  task?: TaskType
  t: TFunction // 👈 t رو به صورت پارامتر بگیر
}

export const renderLogFieldValue = (
  field: string,
  value: any,
  options: RenderLogFieldValueOptions
) => {
  const t = options.t
  const emptyPlaceholder = t('tasks.taskLogs.common.empty', '—')
  const invalidDateText = t('tasks.taskLogs.common.invalidDate', 'Invalid date')
  const defaultUserText = t('tasks.taskLogs.common.user', 'User')

  if (value == null || value === '') {
    return (
      <span className='text-muted-foreground text-[11px] sm:text-xs'>
        {emptyPlaceholder}
      </span>
    )
  }

  /* ---------------- date ---------------- */

  if (field === 'dueDate' || field === 'startDate') {
    const date = new Date(value)

    if (isNaN(date.getTime())) {
      return (
        <span className='text-[11px] sm:text-xs text-red-500'>
          {invalidDateText}
        </span>
      )
    }

    return (
      <span className='text-[11px] sm:text-xs text-slate-700 dark:text-slate-100'>
        {formatJalali(date, 'PPP HH:mm', { locale: faIR })}
      </span>
    )
  }

  /* ---------------- status ---------------- */

  if (field === 'status') {
    const status = statuses.find((st) => st.value === value)

    if (!status) {
      return (
        <span className='text-[11px] sm:text-xs text-slate-700 dark:text-slate-100'>
          {String(value)}
        </span>
      )
    }

    const statusKey = formatStatusToEnum(status.value) as TaskStatusEnumType
    const Icon = status.icon

    return (
      <Badge
        variant={TaskStatusEnum[statusKey]}
        className='flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border-0 shadow-sm'
      >
        {Icon && <Icon className='h-3.5 w-3.5' />}
        {status.label}
      </Badge>
    )
  }

  /* ---------------- priority ---------------- */

  if (field === 'priority') {
    const priority = priorities.find((p) => p.value === value)

    if (!priority) {
      return (
        <span className='text-[11px] sm:text-xs text-slate-700 dark:text-slate-100'>
          {String(value)}
        </span>
      )
    }

    const priorityKey = formatStatusToEnum(
      priority.value
    ) as TaskPriorityEnumType

    const Icon = priority.icon

    return (
      <Badge
        variant={TaskPriorityEnum[priorityKey]}
        className='flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium !bg-transparent !shadow-none border-0'
      >
        {Icon && <Icon className='h-3.5 w-3.5' />}
        {priority.label}
      </Badge>
    )
  }

  /* ---------------- assignee ---------------- */

  if (field === 'assignedTo') {
    const assignee = options?.task?.assignedTo

    if (assignee) {
      const name = assignee.name || ''
      const initials = getAvatarFallbackText(name)
      const avatarColor = getAvatarColor(name)

      return (
        <div className='flex items-center gap-2'>
          <Avatar toUser={assignee.username} className='h-6 w-6'>
            <AvatarImage src={assignee.profilePicture || ''} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>

          <span className='text-[11px] sm:text-xs truncate max-w-[140px] text-slate-800 dark:text-slate-100'>
            {name || defaultUserText}
          </span>
        </div>
      )
    }

    return (
      <span className='text-[11px] sm:text-xs text-muted-foreground'>
        {String(value)}
      </span>
    )
  }

  /* ---------------- attachment ---------------- */

  if (field === 'attachment') {
    return (
      <span className='text-[11px] sm:text-xs text-slate-700 dark:text-slate-100 break-all'>
        {String(value)}
      </span>
    )
  }

  /* ---------------- default ---------------- */

  return (
    <span className='text-[11px] sm:text-xs text-slate-700 dark:text-slate-100 whitespace-pre-wrap break-words'>
      {String(value)}
    </span>
  )
}
