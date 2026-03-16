import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from './ui/separator'
import { Link, useLocation } from 'react-router-dom'
import useWorkspaceId from '@/hooks/use-workspace-id'

const Header = () => {
  const location = useLocation()
  const workspaceId = useWorkspaceId()

  const pathname = location.pathname

  const getPageLabel = (pathname: string) => {
    if (pathname.includes('/project/')) return 'پروژه'
    if (pathname.includes('/settings')) return 'تنظیمات'
    if (pathname.includes('/tasks')) return 'وظایف'
    if (pathname.includes('/members')) return 'اعضا'
    return null // Default label
  }

  const pageHeading = getPageLabel(pathname)
  return (
    <header className='flex sticky top-0 z-50 bg-white h-12 shrink-0 items-center border-b'>
      <div className='flex flex-1 items-center gap-2 px-3'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='mr-2 h-4' />
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

            {pageHeading && (
              <>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem className='text-[15px]'>
                  <BreadcrumbPage className='line-clamp-1'>
                    {pageHeading}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

export default Header
