import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { Delete, ListOrdered, MoreHorizontal, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/resuable/confirm-dialog'
import { TaskType } from '@/types/api.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { deleteTaskMutationFn } from '@/lib/api/api'
import { toast } from '@/hooks/use-toast'
import EditTaskDialog from '../edit-task-dialog'
import TaskLogsDialog from './task-logs/task-logs-dialog'

// i18n
import { useTranslation } from 'react-i18next'

interface DataTableRowActionsProps {
  row: Row<TaskType>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openTaskLogs, setOpenTaskLogs] = useState(false)
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { t } = useTranslation() // اگر namespace دیگری داری این را عوض کن

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  })

  const task = row.original
  const taskId = task._id as string
  const taskCode = task.taskCode

  const handleConfirm = () => {
    mutate(
      { workspaceId, taskId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ['all-tasks', workspaceId],
          })

          // اگر API پیام خودش را برمی‌گرداند ولی نمی‌خواهی خام نشان بدهی،
          // می‌توانی فقط از متن ترجمه‌شده خودت استفاده کنی:
          toast({
            title: t('tasks.toast.deleteSuccessTitle'),
            description:
              data?.message || t('tasks.toast.deleteSuccessDescription'),
            variant: 'success',
          })

          setTimeout(() => setOpenDialog(false), 100)
        },
        onError: (error: any) => {
          // اینجا متن خام API را مستقیم نشان نمی‌دهیم
          const status = error?.response?.status

          let errorKey = 'errors.default'

          if (status === 0) errorKey = 'errors.network'
          else if (status === 408 || status === 504) errorKey = 'errors.timeout'
          else if (status === 400 || status === 422)
            errorKey = 'errors.validation'
          else errorKey = 'errors.unknown'

          toast({
            title: t('tasks.toast.deleteErrorTitle'),
            description: t(errorKey),
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal />
            <span className='sr-only'>{t('tasks.menu.openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {/* گزینه لاگ */}
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => setOpenTaskLogs(true)}
          >
            <ListOrdered className='w-4 h-4 mr-2' />
            {t('tasks.menu.logs')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* گزینه ویرایش وظیفه */}
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => setOpenEditDialog(true)}
          >
            <Pencil className='w-4 h-4 mr-2' />
            {t('tasks.menu.edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* گزینه حذف وظیفه */}
          <DropdownMenuItem
            className='!text-destructive cursor-pointer'
            onClick={() => setOpenDialog(true)}
          >
            <Delete className='w-4 h-4 mr-2' />
            {t('tasks.menu.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* لاگ */}
      <TaskLogsDialog
        task={task}
        isOpen={openTaskLogs}
        onClose={() => setOpenTaskLogs(false)}
      />
      {/* دیالوگ ویرایش وظیفه */}
      <EditTaskDialog
        task={task}
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
      />

      {/* دیالوگ تأیید حذف */}
      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
        title={t('tasks.deleteDialog.title')}
        description={t('tasks.deleteDialog.description', { taskCode })}
        confirmText={t('tasks.deleteDialog.confirm')}
        cancelText={t('tasks.deleteDialog.cancel')}
      />
    </>
  )
}
