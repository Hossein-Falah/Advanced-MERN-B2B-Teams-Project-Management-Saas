import ProfileSetting from '@/components/profile/profile-setting/profile-setting'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from 'react-i18next'

export default function ProfileSettings() {
  const { t } = useTranslation()
  return (
    <div className='w-full h-auto py-2'>
      <main>
        <div className='w-full max-w-3xl mx-auto py-3'>
          <h2 className='text-[20px] leading-[30px] font-semibold mb-3'>
            {t('profileSetting.title')}
          </h2>
          <Separator className='my-4 ' />
          <div className='flex flex-col pt-0.5 px-0 '>
            <div className='pt-2'>
              <ProfileSetting />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
