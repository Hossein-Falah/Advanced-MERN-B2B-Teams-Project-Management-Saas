import { Edit3 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import EditProjectForm from './edit-project-form'
import { ProjectType } from '@/types/api.type'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const EditProjectDialog = (props: { project?: ProjectType }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className='mt-1.5 cursor-pointer'>
          <Edit3 className='w-5 h-5' />
        </span>
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg border-0'>
        <DialogHeader>
          <DialogTitle className='mt-4'>
            {t('projects.editProject.title')}
          </DialogTitle>
        </DialogHeader>

        <EditProjectForm project={props.project} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default EditProjectDialog
