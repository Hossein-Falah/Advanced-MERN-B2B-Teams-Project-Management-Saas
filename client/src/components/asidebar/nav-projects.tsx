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
import { useTranslation } from 'react-i18next'

export function NavProjects() {
  const { t } = useTranslation()

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

  const projects = data?.data?.projects || []
  const pagination = data?.meta || ({} as PaginationType)
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
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['allprojects', workspaceId],
          })

          // نمایش فقط پیام عمومی موفقیت، نه متن خام API
          toast({
            title: t('sidebar.navProjects.deleteDialog.toast.successTitle'),
            description: t(
              'sidebar.navProjects.deleteDialog.toast.projectDeleted'
            ),
            variant: 'success',
          })

          navigate(`/workspace/${workspaceId}`)
          setTimeout(() => onCloseDialog(), 100)
        },
        onError: () => {
          // عدم نمایش متن خطای خام API
          // if(err.message)
          toast({
            title: t('sidebar.navProjects.deleteDialog.toast.errorTitle'),
            description: t('errors.unknown'),
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <>
      <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
        <SidebarGroupLabel className='w-full justify-between pr-0'>
          <span>{t('sidebar.navProjects.title')}</span>

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
          {isError ? <div>{t('errors.unknown')}</div> : null}

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
                {t('sidebar.navProjects.emptyDescription')}
              </p>
              <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                <Button
                  variant='link'
                  type='button'
                  className='h-0 p-0 text-[13px] underline font-semibold mt-4'
                  onClick={onOpen}
                >
                  {t('sidebar.navProjects.createProject')}
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
                        <span className='sr-only'>
                          {t('sidebar.navProjects.more')}
                        </span>
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
                        <span>{t('sidebar.navProjects.viewProject')}</span>
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
                          <span>{t('sidebar.navProjects.deleteProject')}</span>
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
                <span>
                  {isFetching
                    ? t('sidebar.navProjects.loadingMore')
                    : t('sidebar.navProjects.more')}
                </span>
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
        title={t('sidebar.navProjects.deleteDialog.title')}
        description={t('sidebar.navProjects.deleteDialog.description', {
          name:
            context?.name || t('sidebar.navProjects.deleteDialog.defaultItem'),
        })}
        confirmText={t('sidebar.navProjects.deleteDialog.confirm')}
        cancelText={t('sidebar.navProjects.deleteDialog.cancel')}
      />
    </>
  )
}
