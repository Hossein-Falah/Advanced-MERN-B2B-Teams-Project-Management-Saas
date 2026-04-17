import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NotFound = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <main className='flex min-h-[80vh] items-center justify-center px-4'>
      <div className='text-center space-y-6 max-w-md'>
        <h1 className='text-7xl font-extrabold tracking-tight text-primary'>
          404
        </h1>

        <h2 className='text-2xl font-semibold'>{t('notFound.title')}</h2>

        <p className='text-muted-foreground text-sm leading-relaxed'>
          {t('notFound.description')}
        </p>

        <div className='flex items-center justify-center gap-3 pt-2'>
          <Button onClick={() => navigate(-1)} variant='outline'>
            {t('notFound.back')}
          </Button>

          <Button asChild>
            <Link to='/'>{t('notFound.goToDashboard')}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

export default NotFound
