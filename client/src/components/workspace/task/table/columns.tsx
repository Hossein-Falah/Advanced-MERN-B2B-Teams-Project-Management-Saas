import { Column, ColumnDef, Row } from '@tanstack/react-table'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

import { DataTableColumnHeader } from './table-column-header'
import { DataTableRowActions } from './table-row-actions'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from '@/constant'
import {
  formatStatusToEnum,
  getAvatarColor,
  getAvatarFallbackText,
} from '@/lib/helper'
import { priorities, statuses } from './data'
import { TaskType } from '@/types/api.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const getColumns = ({
  projectId,
  onOpenComments,
}: {
  projectId?: string
  onOpenComments: (task: TaskType) => void
}): ColumnDef<TaskType>[] => {
  const columns: ColumnDef<TaskType>[] = [
    {
      id: '_id',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='انتخاب همه'
          className='translate-y-[2px]  mr-3'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='انتخاب ردیف'
          className='translate-y-[2px] mr-3 '
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      meta: { displayName: 'عنوان' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='عنوان' />
      ),
      cell: ({ row }) => {
        return (
          <div
            onClick={() => onOpenComments(row.original)}
            className='flex flex-wrap space-x-2 rtl:space-x-reverse cursor-pointer'
          >
            <span
              title={row.original.taskCode}
              className='block lg:max-w-[220px] max-w-[200px] min-w-[150px] font-medium break-words line-clamp-1'
            >
              {row.original.title}
            </span>
          </div>
        )
      },
    },
    ...(projectId
      ? []
      : [
          {
            accessorKey: 'project',
            meta: { displayName: 'پروژه' },
            header: ({ column }: { column: Column<TaskType, unknown> }) => (
              <DataTableColumnHeader column={column} title='پروژه' />
            ),
            cell: ({ row }: { row: Row<TaskType> }) => {
              const project = row.original.project
              if (!project) return null
              return (
                <div className='flex items-center gap-1'>
                  <span className='rounded-full border'>{project.emoji}</span>
                  <span className='block capitalize truncate w-[100px] text-ellipsis'>
                    {project.name}
                  </span>
                </div>
              )
            },
          },
        ]),
    {
      accessorKey: 'assignedTo',
      meta: { displayName: 'مسئول' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='مسئول' />
      ),
      cell: ({ row }) => {
        const assignee = row.original.assignedTo || null
        const name = assignee?.name || ''
        const initials = getAvatarFallbackText(name)
        const avatarColor = getAvatarColor(name)

        return (
          name && (
            <div className='flex items-center gap-1'>
              <Avatar toUser={row.original?.assignedTo?.username} className=''>
                <AvatarImage
                  src={row.original?.assignedTo?.profilePicture || ''}
                  alt='تصویر'
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className='block text-ellipsis w-[100px] truncate'>
                {assignee?.name}
              </span>
            </div>
          )
        )
      },
    },
    {
      accessorKey: 'dueDate',
      meta: { displayName: 'تاریخ سررسید' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='تاریخ سررسید' />
      ),
      cell: ({ row }) => {
        return (
          <span className='lg:max-w-[100px] text-sm '>
            {row.original.dueDate
              ? formatJalali(new Date(row.original.dueDate), 'PPP HH:mm', {
                  locale: faIR,
                })
              : null}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      meta: { displayName: 'وضعیت' },
      header: ({ column }) => (
        <DataTableColumnHeader
          className='min-w-[100px]'
          column={column}
          title='وضعیت'
        />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue('status'),
        )
        if (!status) return null
        const statusKey = formatStatusToEnum(status.value) as TaskStatusEnumType
        const Icon = status.icon
        if (!Icon) return null
        return (
          <div className='flex lg:w-[120px] items-center'>
            <Badge
              variant={TaskStatusEnum[statusKey]}
              className='flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0'
            >
              <Icon className='h-4 w-4 rounded-full text-inherit' />
              <span>{status.label}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'priority',
      meta: { displayName: 'اولویت' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='اولویت' />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue('priority'),
        )
        if (!priority) return null
        const statusKey = formatStatusToEnum(
          priority.value,
        ) as TaskPriorityEnumType
        const Icon = priority.icon
        if (!Icon) return null
        return (
          <div className='flex items-center'>
            <Badge
              variant={TaskPriorityEnum[statusKey]}
              className='flex lg:w-[110px] p-1 gap-1 !bg-transparent font-medium !shadow-none uppercase border-0'
            >
              <Icon className='h-4 w-4 rounded-full text-inherit' />
              <span>{priority.label}</span>
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'actions',
      meta: { displayName: 'عملیات' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='عملیات' />
      ),
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]

  return columns
}
