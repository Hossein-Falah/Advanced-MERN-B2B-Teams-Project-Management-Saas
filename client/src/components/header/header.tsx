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

const Header = () => {
  const location = useLocation()
  const workspaceId = useWorkspaceId()
  const pathname = location.pathname

  const pageHeading = getPageLabel(pathname)
  return (
    <header className='flex fixed w-full  md:sticky top-0 z-50 bg-white h-12 shrink-0 items-center border-b'>
      <div className='flex w-full justify-between items-center gap-2 px-3'>
        {/* right */}
        <div className='flex items-center gap-2 '>
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
                    <Link to={`/workspace/${workspaceId}`}>داشبورد</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className='line-clamp-1 '>
                    داشبورد
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {pageHeading?.map((ph) => (
                <>
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem className='hidden md:block text-[15px]'>
                    <BreadcrumbPage className='line-clamp-1'>
                      {ph}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* left */}
        <Notification />
      </div>
    </header>
  )
}

export default Header
