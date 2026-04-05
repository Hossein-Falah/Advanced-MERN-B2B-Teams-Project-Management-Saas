import { Dialog, DialogContent } from '@/components/ui/dialog'
import EditAutomationForm from './edit-automation-form'
import { AutomationItem } from '@/types/automation.type'

const EditAutomationDialog = ({
  automation,
  isOpen,
  onClose,
}: {
  automation: AutomationItem
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg max-h-auto my-5 border-0'>
        <EditAutomationForm automation={automation} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default EditAutomationDialog
