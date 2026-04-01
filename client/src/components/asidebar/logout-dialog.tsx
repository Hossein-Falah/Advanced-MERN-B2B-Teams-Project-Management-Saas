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

const LogoutDialog = (props: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { isOpen, setIsOpen } = props
  const navigate = useNavigate()

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
    onError: (error) => {
      toast({
        title: 'خطا',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Handle logout action
  const handleLogout = useCallback(() => {
    if (isPending) return
    mutate()
  }, [isPending, mutate])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>آیا مطمئن هستید می‌خواهید خارج شوید؟</DialogTitle>
            <DialogDescription>
              با این کار نشست فعلی شما پایان می‌یابد و برای دسترسی دوباره باید
              دوباره وارد شوید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button disabled={isPending} type='button' onClick={handleLogout}>
              {isPending && <Loader className='animate-spin' />}
              خروج از حساب
            </Button>
            <Button type='button' onClick={() => setIsOpen(false)}>
              انصراف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LogoutDialog
