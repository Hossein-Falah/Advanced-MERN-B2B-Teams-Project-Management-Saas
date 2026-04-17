import { Dialog, DialogContent } from '@/components/ui/dialog'
import EditTaskForm from './edit-task-form'
import { TaskType } from '@/types/api.type'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'

const EditTaskDialog = ({
  task,
  isOpen,
  onClose,
}: {
  task: TaskType
  isOpen: boolean
  onClose: () => void
}) => {
  const { t } = useTranslation()
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg max-h-auto my-5 border-0'>
        <DialogTitle className='mt-4'>
          {' '}
          {t('tasks.editTask.subtitle')}
        </DialogTitle>
        <EditTaskForm task={task} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default EditTaskDialog
