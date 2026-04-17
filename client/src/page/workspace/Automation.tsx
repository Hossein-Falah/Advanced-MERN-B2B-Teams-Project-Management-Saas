import { useTranslation } from 'react-i18next'
import CreateAutomationDialog from '@/components/workspace/automation/create-automation-dialog'
import AutomationTable from '@/components/workspace/automation/table/automation-table'

const Automation = () => {
  const { t } = useTranslation()

  return (
    <div className='w-full h-full flex-col space-y-8 pt-3' dir='rtl'>
      <div className='flex items-center justify-between space-y-2'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('automations.mainPage.title')}
          </h2>
          <p className='text-muted-foreground'>
            {t('automations.mainPage.description')}
          </p>
        </div>
        <CreateAutomationDialog />
      </div>

      <div>
        <AutomationTable />
      </div>
    </div>
  )
}

export default Automation
