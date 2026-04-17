import { Separator } from '@/components/ui/separator'
import InviteMember from '@/components/workspace/member/invite-member'
import AllMembers from '@/components/workspace/member/all-members'
import WorkspaceHeader from '@/components/workspace/common/workspace-header'
import { useTranslation } from 'react-i18next'

export default function Members() {
  const { t } = useTranslation()

  return (
    <div className='w-full h-auto pt-2' dir='rtl'>
      <WorkspaceHeader />
      <Separator className='my-4 ' />
      <main>
        <div className='w-full max-w-3xl mx-auto pt-3'>
          <div>
            <h2 className='text-lg leading-[30px] font-semibold mb-1'>
              {t('members.mainPage.title')}
            </h2>
            <p className='text-sm text-muted-foreground leading-7'>
              {t('members.mainPage.description')}
            </p>
          </div>

          <Separator className='my-4' />

          <InviteMember />

          <Separator className='my-4 !h-[0.5px]' />

          <AllMembers />
        </div>
      </main>
    </div>
  )
}
