import {
  ArrowRight,
  Folder,
  Loader,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import useWorkspaceId from '@/hooks/use-workspace-id'
import useCreateProjectDialog from '@/hooks/use-create-project-dialog'
import { ConfirmDialog } from '../resuable/confirm-dialog'
import useConfirmDialog from '@/hooks/use-confirm-dialog'
import { Button } from '../ui/button'
import { Permissions } from '@/constant'
import PermissionsGuard from '../resuable/permission-guard'
import { useState } from 'react'
import useGetProjectsInWorkspaceQuery from '@/hooks/api/use-get-projects'
import { PaginationType } from '@/types/api.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProjectMutationFn } from '@/lib/api/api'
import { toast } from '@/hooks/use-toast'

export function NavProjects() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { isMobile } = useSidebar()
  const { onOpen } = useCreateProjectDialog()
  const { context, open, onOpenDialog, onCloseDialog } = useConfirmDialog()

  const [pageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  })

  const { data, isPending, isFetching, isError } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    })

  const projects = data?.projects || []
  const pagination = data?.pagination || ({} as PaginationType)
  const hasMore = pagination?.totalPages > pageNumber

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return
    setPageSize((prev) => prev + 5)
  }

  const handleConfirm = () => {
    if (!context) return
    mutate(
      {
        workspaceId,
        projectId: context?._id,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ['allprojects', workspaceId],
          })
          toast({
            title: 'موفق',
            description: data.message,
            variant: 'success',
          })

          navigate(`/workspace/${workspaceId}`)
          setTimeout(() => onCloseDialog(), 100)
        },
        onError: (error) => {
          toast({
            title: 'خطا',
            description: error.message,
            variant: 'destructive',
          })
        },
      },
    )
  }
  return (
    <>
      <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
        <SidebarGroupLabel className='w-full justify-between pr-0'>
          <span>پروژه / هدف</span>

          <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
            <button
              onClick={onOpen}
              type='button'
              className='flex size-5 items-center justify-center rounded-full border'
            >
              <Plus className='size-3.5' />
            </button>
          </PermissionsGuard>
        </SidebarGroupLabel>
        <SidebarMenu className='h-[320px] scrollbar overflow-y-auto pb-2'>
          {isError ? <div>خطا رخ داد</div> : null}
          {isPending ? (
            <Loader
              className=' w-5 h-5
             animate-spin
              place-self-center'
            />
          ) : null}

          {!isPending && projects?.length === 0 ? (
            <div className='pl-3'>
              <p className='text-xs text-muted-foreground leading-6'>
                هنوز پروژه‌ای در این فضای کاری وجود ندارد. پروژه‌هایی که ایجاد
                می‌کنید اینجا نمایش داده می‌شوند.
              </p>
              <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                <Button
                  variant='link'
                  type='button'
                  className='h-0 p-0 text-[13px] underline font-semibold mt-4'
                  onClick={onOpen}
                >
                  ایجاد پروژه
                  <ArrowRight />
                </Button>
              </PermissionsGuard>
            </div>
          ) : (
            projects.map((item) => {
              const projectUrl = `/workspace/${workspaceId}/project/${item._id}`

              return (
                <SidebarMenuItem key={item._id}>
                  <SidebarMenuButton asChild isActive={projectUrl === pathname}>
                    <Link to={projectUrl}>
                      {item.emoji}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className='sr-only'>بیشتر</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className='w-48 rounded-lg'
                      side={isMobile ? 'bottom' : 'right'}
                      align={isMobile ? 'end' : 'start'}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`${projectUrl}`)}
                      >
                        <Folder className='text-muted-foreground' />
                        <span>مشاهده پروژه</span>
                      </DropdownMenuItem>

                      <PermissionsGuard
                        requiredPermission={Permissions.DELETE_PROJECT}
                      >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isLoading}
                          onClick={() => onOpenDialog(item)}
                        >
                          <Trash2 className='text-muted-foreground' />
                          <span>حذف پروژه</span>
                        </DropdownMenuItem>
                      </PermissionsGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )
            })
          )}

          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className='text-sidebar-foreground/70'
                disabled={isFetching}
                onClick={fetchNextPage}
              >
                <MoreHorizontal className='text-sidebar-foreground/70' />
                <span>{isFetching ? 'در حال بارگذاری...' : 'بیشتر'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <ConfirmDialog
        isOpen={open}
        isLoading={isLoading}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title='حذف پروژه'
        description={`آیا مطمئن هستید می‌خواهید ${
          context?.name || 'این مورد'
        } را حذف کنید؟ این عمل قابل بازگشت نیست.`}
        confirmText='حذف'
        cancelText='انصراف'
      />
    </>
  )
}
