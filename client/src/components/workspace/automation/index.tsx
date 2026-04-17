import AutomationTable from './table/automation-table'
import { useTranslation } from 'react-i18next'

const AutomationPage = () => {
  const { t } = useTranslation()

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>{t('automations.title')}</h1>

      <AutomationTable />
    </div>
  )
}

export default AutomationPage
