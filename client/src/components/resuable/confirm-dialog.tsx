import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  children?: React.ReactNode
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  title = 'تأیید عملیات',
  description = 'آیا از انجام این عملیات مطمئن هستید؟',
  confirmText = 'تأیید',
  cancelText = 'انصراف',
  children,
}) => {
  const handleClose = () => {
    if (isLoading) return
    onClose()
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md' dir='rtl'>
        <DialogHeader className='mt-4 flex flex-col gap-3'>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className='py-4'>{children}</div>}
        <DialogFooter className='gap-3'>
          <Button variant='outline' onClick={handleClose}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader className='w-4 h-4 animate-spin mr-2' />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
