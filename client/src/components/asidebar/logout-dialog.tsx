import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logoutMutationFn } from '@/lib/api/api'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LogoutDialog = (props: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { isOpen, setIsOpen } = props
  const navigate = useNavigate()
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ['authUser'],
      })
      navigate('/')
      setIsOpen(false)
    },
    onError: () => {
      toast({
        title: t('sidebar.sidebar.logoutDialog.errorTitle'),
        description: t('sidebar.sidebar.logoutDialog.errorMessage'),
        variant: 'destructive',
      })
    },
  })

  const handleLogout = useCallback(() => {
    if (isPending) return
    mutate()
  }, [isPending, mutate])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sidebar.logoutDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('sidebar.logoutDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className=' gap-2'>
          <Button
            className='bg-red-600 hover:bg-red-500'
            disabled={isPending}
            type='button'
            onClick={handleLogout}
          >
            {isPending && <Loader className='animate-spin' />}
            {t('sidebar.logoutDialog.confirm')}
          </Button>

          <Button type='button' onClick={() => setIsOpen(false)}>
            {t('sidebar.logoutDialog.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutDialog
