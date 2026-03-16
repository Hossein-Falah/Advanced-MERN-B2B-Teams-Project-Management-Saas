import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import CreateTaskForm from './create-task-form'

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          وظیفه جدید
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg max-h-auto my-5 border-0'>
        <DialogHeader>
          <DialogTitle className='mt-4'>ایجاد وظیفه جدید</DialogTitle>
          {/* در صورت نیاز می‌توانید توضیحی اضافه کنید */}
          {/* <DialogDescription>فرم ایجاد وظیفه را پر کنید.</DialogDescription> */}
        </DialogHeader>
        <CreateTaskForm projectId={props.projectId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateTaskDialog
