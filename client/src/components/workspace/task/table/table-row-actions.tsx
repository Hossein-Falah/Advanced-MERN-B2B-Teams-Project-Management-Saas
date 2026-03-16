import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/resuable/confirm-dialog'
import { TaskType } from '@/types/api.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { deleteTaskMutationFn } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import EditTaskDialog from '../edit-task-dialog'

interface DataTableRowActionsProps {
  row: Row<TaskType>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

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
          toast({
            title: 'موفق',
            description: data.message,
            variant: 'success',
          })
          setTimeout(() => setOpenDialog(false), 100)
        },
        onError: (error) => {
          toast({
            title: 'خطا',
            description: error.message,
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
            <span className='sr-only'>باز کردن منو</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {/* گزینه ویرایش تسک */}
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => setOpenEditDialog(true)}
          >
            <Pencil className='w-4 h-4 mr-2' /> ویرایش تسک
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* گزینه حذف تسک */}
          <DropdownMenuItem
            className='!text-destructive cursor-pointer'
            onClick={() => setOpenDialog(true)}
          >
            حذف تسک
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* دیالوگ ویرایش تسک */}
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
        title='حذف تسک'
        description={`آیا از حذف تسک ${taskCode} مطمئن هستید؟`}
        confirmText='حذف'
        cancelText='انصراف'
      />
    </>
  )
}
