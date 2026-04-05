// AutomationRowActions.tsx
import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { Delete, MoreHorizontal, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/resuable/confirm-dialog'
import { AutomationItem } from '@/types/automation.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { deleteAutomationMutationFn } from '@/lib/api/automation'
import { toast } from '@/hooks/use-toast'
import EditAutomationDialog from '../edit-automation-dialog' // مسیر رو متناسب با پروژه‌ات اصلاح کن

interface AutomationRowActionsProps {
  row: Row<AutomationItem>
}

export function AutomationRowActions({ row }: AutomationRowActionsProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate, isPending } = useMutation({
    mutationFn: deleteAutomationMutationFn,
  })

  const automation = row.original
  const automationId = automation._id
  const automationCode = automation.taskId.title ?? ''

  const handleConfirmDelete = () => {
    mutate(
      { workspaceId, automationId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ['all-automations', workspaceId],
          })
          toast({
            title: 'موفق',
            description: data.message,
            variant: 'success',
          })
          setTimeout(() => setOpenDeleteDialog(false), 100)
        },
        onError: (error: any) => {
          toast({
            title: 'خطا',
            description: error.message,
            variant: 'destructive',
          })
        },
      },
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
          {/* گزینه ویرایش اتوماسیون */}
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => setOpenEditDialog(true)}
          >
            <Pencil className='w-4 h-4 mr-2' /> ویرایش ایتم
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* گزینه حذف اتوماسیون */}
          <DropdownMenuItem
            className='!text-destructive cursor-pointer'
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Delete className='w-4 h-4 mr-2' />
            حذف اتوماسیون
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* دیالوگ ویرایش اتوماسیون */}
      <EditAutomationDialog
        automation={automation}
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
      />

      {/* دیالوگ تأیید حذف */}
      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title='حذف اتوماسیون'
        description={`آیا از حذف اتوماسیون ${automationCode} مطمئن هستید؟`}
        confirmText='حذف'
        cancelText='انصراف'
      />
    </>
  )
}
