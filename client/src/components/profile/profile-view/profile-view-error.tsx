import { useNavigate, useParams } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Input } from '../../ui/input'
import { useTranslation } from 'react-i18next'

const ProfileViewError = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const { t } = useTranslation()

  const handleSearch = () => {
    if (!searchValue.trim()) return
    const currentPath = location.pathname
    const parts = currentPath.split('/')
    parts[parts.length - 1] = searchValue.trim()
    const newPath = parts.join('/')
    navigate(newPath)
  }

  return (
    <div
      className='w-full max-w-xl mx-auto px-4 lg:px-6 py-10 flex items-center justify-center'
      dir='rtl'
    >
      <Card className='w-full shadow-sm border'>
        <CardContent className='py-8 flex flex-col items-center justify-center gap-6'>
          <h2 className='text-base lg:text-lg font-semibold text-center'>
            {t('profileView.error.title')}
          </h2>

          <p className='text-xs lg:text-sm text-muted-foreground text-center max-w-md leading-6'>
            {t('profileView.error.description', { username })}
          </p>

          <div className='flex w-full max-w-sm items-center gap-2'>
            <Input
              placeholder={t('profileView.error.searchPlaceholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className='text-sm'
            />
            <Button size='sm' className='gap-1' onClick={handleSearch}>
              <Search className='w-4 h-4' />
              {t('common.search')}
            </Button>
          </div>

          <Button
            onClick={() => navigate(-1)}
            variant='ghost'
            size='sm'
            className='gap-2 text-xs'
          >
            {t('common.back')}
            <ArrowRight className='w-4 h-4' />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileViewError
