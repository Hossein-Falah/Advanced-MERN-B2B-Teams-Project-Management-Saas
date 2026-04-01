import { Separator } from '@/components/ui/separator'
import InviteMember from '@/components/workspace/member/invite-member'
import AllMembers from '@/components/workspace/member/all-members'
import WorkspaceHeader from '@/components/workspace/common/workspace-header'

export default function Members() {
  return (
    <div className='w-full h-auto pt-2' dir='rtl'>
      <WorkspaceHeader />
      <Separator className='my-4 ' />
      <main>
        <div className='w-full max-w-3xl mx-auto pt-3'>
          <div>
            <h2 className='text-lg leading-[30px] font-semibold mb-1'>
              اعضای فضای کاری
            </h2>
            <p className='text-sm text-muted-foreground leading-7'>
              اعضای فضای کاری می‌توانند تمام پروژه‌ها و وظیفه ‌های فضای کاری را
              مشاهده کرده و به آنها بپیوندند و وظیفه ‌های جدیدی در فضای کاری
              ایجاد کنند.
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
