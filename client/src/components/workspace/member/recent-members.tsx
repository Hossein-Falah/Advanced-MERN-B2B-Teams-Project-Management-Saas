import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { format } from 'date-fns-jalali'
import { Loader } from 'lucide-react'

const RecentMembers = () => {
  const workspaceId = useWorkspaceId()
  const { data, isPending } = useGetWorkspaceMembers(workspaceId)
  const getRoleDisplayName = (roleName: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: 'مدیر',
      MEMBER: 'عضو',
      OWNER: 'مالک',
    }
    return roleMap[roleName] || roleName?.toLowerCase()
  }
  const members = data?.members || []

  return (
    <div className='flex flex-col pt-2'>
      {isPending ? (
        <Loader
          className='w-8 h-8 
        animate-spin
        place-self-center flex'
        />
      ) : null}

      <ul role='list' className='space-y-3'>
        {members.map((member, index) => {
          const name = member?.userId?.name || ''
          const initials = getAvatarFallbackText(name)
          const avatarColor = getAvatarColor(name)
          return (
            <li
              key={index}
              role='listitem'
              className='flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50'
            >
              {/* Avatar */}
              <div className='flex-shrink-0'>
                <Avatar className='h-9 w-9 sm:flex'>
                  <AvatarImage
                    src={member.userId.profilePicture || ''}
                    alt='Avatar'
                  />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Member Details */}
              <div className='flex flex-col'>
                <p className='text-sm font-medium text-gray-900'>
                  {member.userId.name}
                </p>
                <p className='text-sm text-gray-500'>
                  {' '}
                  {getRoleDisplayName(member.role.name)}
                </p>
              </div>

              {/* Joined Date */}
              <div className='mr-auto text-sm leading-5  text-gray-500'>
                <p className='font-extralight'>عضو شده در تاریخ</p>
                <p>{member.joinedAt ? format(member.joinedAt, 'PPP') : null}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentMembers
