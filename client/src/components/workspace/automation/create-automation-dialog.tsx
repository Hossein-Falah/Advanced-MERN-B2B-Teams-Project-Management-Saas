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
import CreateAutomationForm from './create-automation-form'
import { useTranslation } from 'react-i18next' // یا مسیر/کتابخانه‌ی خودت

const CreateAutomationDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t('automations.createNewAutomationButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg max-h-auto my-5 border-0'>
        <DialogHeader>
          <DialogTitle className='mt-4'>
            {t('automations.createNewAutomationTitle')}
          </DialogTitle>
        </DialogHeader>
        <CreateAutomationForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateAutomationDialog
