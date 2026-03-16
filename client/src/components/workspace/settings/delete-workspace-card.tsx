import { ConfirmDialog } from '@/components/resuable/confirm-dialog'
import PermissionsGuard from '@/components/resuable/permission-guard'
import { Button } from '@/components/ui/button'
import { Permissions } from '@/constant'
import { useAuthContext } from '@/context/auth-provider'
import useConfirmDialog from '@/hooks/use-confirm-dialog'
import { toast } from '@/hooks/use-toast'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { deleteWorkspaceMutationFn } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const DeleteWorkspaceCard = () => {
  const { workspace } = useAuthContext()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { open, onOpenDialog, onCloseDialog } = useConfirmDialog()

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkspaceMutationFn,
  })

  const handleConfirm = () => {
    mutate(workspaceId, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['userWorkspaces'],
        })
        navigate(`/workspace/${data.currentWorkspace}`)
        setTimeout(() => onCloseDialog(), 100)
      },
      onError: (error) => {
        toast({
          title: 'خطا',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  }
  return (
    <>
      <div className='w-full' dir='rtl'>
        <div className='mb-5 border-b'>
          <h1
            className='text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5
           text-center sm:text-right'
          >
            حذف فضای کاری
          </h1>
        </div>

        <PermissionsGuard
          showMessage
          requiredPermission={Permissions.DELETE_WORKSPACE}
        >
          <div className='flex flex-col items-start justify-between py-0'>
            <div className='flex-1 mb-2'>
              <p>
                حذف یک فضای کاری یک اقدام دائمی است و قابل بازگشت نیست. پس از
                حذف فضای کاری، تمام داده‌های مرتبط با آن، از جمله پروژه‌ها،
                تسک‌ها و نقش‌های اعضا، برای همیشه پاک خواهند شد. لطفاً با احتیاط
                عمل کنید و از انجام عمدی این کار مطمئن شوید.
              </p>
            </div>
            <Button
              className='shrink-0 flex place-self-end h-[40px]'
              variant='destructive'
              onClick={onOpenDialog}
            >
              حذف فضای کاری
            </Button>
          </div>
        </PermissionsGuard>
      </div>

      <ConfirmDialog
        isOpen={open}
        isLoading={isPending}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title={`حذف فضای کاری ${workspace?.name}`}
        description={`آیا از حذف این فضای کاری مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmText='حذف'
        cancelText='انصراف'
      />
    </>
  )
}

export default DeleteWorkspaceCard
