import Analytics from '@/components/workspace/analytics/analytics'
import { useTranslation } from 'react-i18next'

const AnalyticsPage = () => {
  const { t } = useTranslation()
  return (
    <div className='w-full h-full flex-col space-y-8 pt-3' dir='rtl'>
      <div className='flex items-center justify-between space-y-2'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('analytics.analyticsPage.title')}
          </h2>
        </div>
      </div>

      <div>
        <Analytics />
      </div>
    </div>
  )
}

export default AnalyticsPage
