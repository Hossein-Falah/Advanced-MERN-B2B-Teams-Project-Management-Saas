import { ChevronDown, Loader } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { useAuthContext } from '@/context/auth-provider'
import useWorkspaceId from '@/hooks/use-workspace-id'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changeWorkspaceMemberRoleMutationFn } from '@/lib/api/api'
import { toast } from '@/hooks/use-toast'
import { Permissions } from '@/constant'

// اگر از react-i18next استفاده می‌کنی:
import { useTranslation } from 'react-i18next'
import { getRoleDisplayName } from '@/utils/getRoleDisplayName'

const AllMembers = () => {
  const { t } = useTranslation()
  const { user, hasPermission } = useAuthContext()

  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE)

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { data, isPending } = useGetWorkspaceMembers(workspaceId)
  const members = data?.data?.members || []
  const roles = data?.data?.roles || []

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  })

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    }
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['members', workspaceId],
        })
        toast({
          title: t('members.changeRole.successTitle'),
          description: t('members.changeRole.successDescription'),
          variant: 'success',
        })
      },
      onError: () => {
        // نمایش پیام کلی و عدم نمایش متن خام API
        toast({
          title: t('members.changeRole.errorTitle'),
          description: t('members.changeRole.errorDescription'),
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className='grid gap-6 pt-2' dir='rtl'>
      {isPending ? (
        <Loader className='w-8 h-8 animate-spin place-self-center flex' />
      ) : null}

      {members?.map((member) => {
        const name = member.userId?.name
        const initials = getAvatarFallbackText(name)
        const avatarColor = getAvatarColor(name)

        const isCurrentUser = member.userId._id === user?._id

        return (
          <div
            key={member._id}
            className='flex items-center justify-between space-x-4 rtl:space-x-reverse'
          >
            <div className='flex items-center space-x-4 rtl:space-x-reverse'>
              <Avatar toUser={member.userId?.username} className='h-8 w-8'>
                <AvatarImage
                  src={member.userId?.profilePicture || ''}
                  alt={t('members.avatarAlt')}
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium leading-none'>{name}</p>
                <p className='text-sm text-muted-foreground'>
                  {member.userId.email}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mr-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none'
                    disabled={
                      isLoading || !canChangeMemberRole || isCurrentUser
                    }
                  >
                    {getRoleDisplayName(member.role.name, t)}{' '}
                    {canChangeMemberRole && !isCurrentUser && (
                      <ChevronDown className='text-muted-foreground' />
                    )}
                  </Button>
                </PopoverTrigger>
                {canChangeMemberRole && !isCurrentUser && (
                  <PopoverContent className='p-0' align='end'>
                    <Command>
                      <CommandInput
                        placeholder={t('members.changeRole.searchPlaceholder')}
                        disabled={isLoading}
                        className='disabled:pointer-events-none'
                      />
                      <CommandList>
                        {isLoading ? (
                          <Loader className='w-8 h-8 animate-spin place-self-center flex my-4' />
                        ) : (
                          <>
                            <CommandEmpty>
                              {t('members.changeRole.noRoleFound')}
                            </CommandEmpty>
                            <CommandGroup>
                              {roles?.map(
                                (role) =>
                                  role.name !== 'OWNER' && (
                                    <CommandItem
                                      key={role._id}
                                      disabled={isLoading}
                                      className='disabled:pointer-events-none gap-1 mb-1 flex flex-col items-start px-4 py-2 cursor-pointer'
                                      onSelect={() => {
                                        handleSelect(
                                          role._id,
                                          member.userId._id
                                        )
                                      }}
                                    >
                                      <p className='capitalize'>
                                        {getRoleDisplayName(role.name, t)}
                                      </p>
                                      <p className='text-sm text-muted-foreground'>
                                        {role.name === 'ADMIN' &&
                                          t('roles.roleDescriptions.ADMIN')}
                                        {role.name === 'MEMBER' &&
                                          t('roles.roleDescriptions.MEMBER')}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AllMembers
