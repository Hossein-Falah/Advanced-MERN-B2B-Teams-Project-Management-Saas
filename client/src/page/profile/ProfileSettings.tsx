import ProfileSetting from '@/components/profile/profile-setting'
import { Separator } from '@/components/ui/separator'

export default function ProfileSettings() {
  return (
    <div className='w-full h-auto py-2'>
      <main>
        <div className='w-full max-w-3xl mx-auto py-3'>
          <h2 className='text-[20px] leading-[30px] font-semibold mb-3'>
            ویرایش پروفایل کاربری
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
