import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { Delete, MoreHorizontal, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import EditAutomationDialog from '../edit-automation-dialog'

interface AutomationRowActionsProps {
  row: Row<AutomationItem>
}

export function AutomationRowActions({ row }: AutomationRowActionsProps) {
  const { t } = useTranslation()

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate, isPending } = useMutation({
    mutationFn: deleteAutomationMutationFn,
  })

  const automation = row.original
  const automationId = automation._id
  const automationCode = automation.taskId?.title ?? ''

  const handleConfirmDelete = () => {
    mutate(
      { workspaceId, automationId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['all-automations', workspaceId],
          })

          toast({
            title: t('common.success'),
            description: t('automations.messages.deleteSuccess'),
            variant: 'success',
          })

          setTimeout(() => setOpenDeleteDialog(false), 100)
        },

        onError: () => {
          toast({
            title: t('common.error'),
            description: t('automations.errors.deleteFailed'),
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
            <span className='sr-only'>{t('common.openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => setOpenEditDialog(true)}
          >
            <Pencil className='w-4 h-4 mr-2' />
            {t('automations.actions.edit')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className='!text-destructive cursor-pointer'
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Delete className='w-4 h-4 mr-2' />
            {t('automations.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAutomationDialog
        automation={automation}
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
      />

      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t('automations.deleteDialog.title')}
        description={t('automations.deleteDialog.description', {
          name: automationCode,
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </>
  )
}
