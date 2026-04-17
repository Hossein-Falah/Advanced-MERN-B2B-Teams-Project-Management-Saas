import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '../ui/separator'
import { Link, useLocation } from 'react-router-dom'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { getPageLabel } from '@/utils/getPageLabel'
import Notification from './notification'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/language-switcher'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { Settings2Icon } from 'lucide-react'
import ThemeSwitcher from '../ui/theme-switcher'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const workspaceId = useWorkspaceId()
  const pathname = location.pathname

  const pageHeading = getPageLabel(pathname)

  return (
    <header className='flex fixed w-full md:sticky top-0 z-50 bg-white h-12 shrink-0 items-center border-b'>
      <div className='flex w-full justify-between items-center gap-2 px-3'>
        {/* right section */}
        <div className='flex items-center gap-2'>
          <SidebarTrigger />
          <Separator
            orientation='vertical'
            className='hidden md:block mr-1 h-4'
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block text-[15px]'>
                {pageHeading ? (
                  <BreadcrumbLink asChild>
                    <Link to={`/workspace/${workspaceId}`}>
                      {t('header.dashboard')}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className='line-clamp-1'>
                    {t('header.dashboard')}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {pageHeading?.map((ph) => (
                <span
                  className='flex gap-2 justify-center items-center'
                  key={ph}
                >
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem className='hidden md:block text-[15px]'>
                    <BreadcrumbPage className='line-clamp-1'>
                      {ph}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* left section */}
        <div className='flex items-center gap-3'>
          <Notification />

          <DropdownMenu>
            <DropdownMenuTrigger className='focus:outline-none'>
              <Settings2Icon className='w-5 h-5 text-gray-600 hover:text-black transition cursor-pointer' />
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-40 py-1'>
              <DropdownMenuItem className='cursor-pointer'>
                <LanguageSwitcher />
              </DropdownMenuItem>

              <DropdownMenuItem className='cursor-pointer'>
                <ThemeSwitcher />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
