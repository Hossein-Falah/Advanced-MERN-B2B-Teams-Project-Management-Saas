import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EditIcon, EllipsisVerticalIcon, Loader, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Logo from '@/components/logo'
import LogoutDialog from './logout-dialog'
import { WorkspaceSwitcher } from './workspace-switcher'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { Separator } from '../ui/separator'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { useAuthContext } from '@/context/auth-provider'

const Asidebar = () => {
  const { t } = useTranslation()
  const { isLoading, user } = useAuthContext()
  const navigate = useNavigate()
  const { open } = useSidebar()
  const workspaceId = useWorkspaceId()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Sidebar collapsible='icon'>
        <SidebarHeader className='!py-0 dark:bg-background'>
          <div className='flex h-[50px] items-center justify-start w-full px-1'>
            <Logo />
            {open && (
              <Link
                to={`/workspace/${workspaceId}`}
                className='hidden md:flex mr-2 items-center gap-2 self-center font-medium'
              >
                {t('sidebar.brand')}
              </Link>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className=' !mt-0 dark:bg-background'>
          <SidebarGroup className='!py-0'>
            <SidebarGroupContent>
              <WorkspaceSwitcher />
              <Separator />
              <NavMain />
              <Separator />
              <NavProjects />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className='dark:bg-background'>
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader
                  size='24px'
                  className='place-self-center self-center animate-spin'
                />
              ) : (
                <DropdownMenu>
                  <div
                    onClick={() =>
                      navigate(
                        `/workspace/${workspaceId}/profile/${user?.username}`
                      )
                    }
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent p-1 rounded-md '
                  >
                    <Avatar className='h-8 w-8 rounded-full hover:scale-110 hover:-rotate-12 duration-300 ease-in-out'>
                      <AvatarImage src={user?.profilePicture || ''} />
                      <AvatarFallback className='rounded-full border border-gray-500'>
                        {user?.name?.split(' ')?.[0]?.charAt(0)}
                        {user?.name?.split(' ')?.[1]?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <DropdownMenuTrigger asChild>
                      <div className='flex items-center gap-2'>
                        <div className='grid flex-1 text-left text-sm leading-tight'>
                          <span className='truncate font-semibold'>
                            {user?.name}
                          </span>
                          <span className='truncate text-xs'>
                            {user?.email}
                          </span>
                        </div>

                        <EllipsisVerticalIcon className='ml-auto size-4 ' />
                      </div>
                    </DropdownMenuTrigger>
                  </div>

                  <DropdownMenuContent
                    className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                    side={'bottom'}
                    align='start'
                    sideOffset={4}
                  >
                    <DropdownMenuGroup />

                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/workspace/${workspaceId}/profile/settings`)
                      }
                    >
                      <EditIcon />
                      {t('sidebar.editProfile')}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                      <LogOut />
                      {t('sidebar.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}

export default Asidebar
