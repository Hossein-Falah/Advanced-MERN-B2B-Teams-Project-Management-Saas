import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Eye, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthContext } from '@/context/auth-provider'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  useNotifications,
  useReadAllNotifications,
  useReadSingleNotification,
} from '@/hooks/use-notifications'
import NotificationItemComponent from './notification-item'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'
import { formatNumberShort } from '@/utils/formatNumberShort'

const LIMIT = 20

const Notification = () => {
  const { t } = useTranslation()

  const { socket, isSocketConnected } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [mergedNotifications, setMergedNotifications] = useState<any[]>([])
  const [isLoadMore, setIsLoadMore] = useState(false)
  const [localUnreadCount, setLocalUnreadCount] = useState<number>(0)

  const listRef = useRef<HTMLDivElement | null>(null)

  const { data, isLoading, isError, refetch, isFetching } = useNotifications({
    page,
    limit: LIMIT,
  })

  const { mutate: readAllMutate, isPending: isReadAllPending } =
    useReadAllNotifications()
  const { mutate: readSingleMutate } = useReadSingleNotification()

  const totalCount = data?.meta?.total ?? 0
  const hasMore = mergedNotifications.length < totalCount

  useEffect(() => {
    if (data?.data?.unreadCount != null) {
      setLocalUnreadCount(data?.data?.unreadCount)
    }
  }, [data?.data?.unreadCount])

  useEffect(() => {
    if (!data?.data?.notifications) return

    setMergedNotifications((prev) => {
      const current = data.data?.notifications ?? [] // همیشه آرایه

      if (page === 1) {
        return current
      }

      const existingIds = new Set(prev.map((n: any) => n._id))
      const newItems = current.filter((n: any) => !existingIds.has(n._id))

      return [...prev, ...newItems]
    })

    if (isLoadMore && listRef.current) {
      const container = listRef.current

      requestAnimationFrame(() => {
        container.scrollTop =
          (container as any).scrollTopBeforeLoad ?? container.scrollTop
        delete (container as any).scrollTopBeforeLoad
      })
    }
    setIsLoadMore(false)
  }, [data, page, isLoadMore])

  useEffect(() => {
    if (!socket || !isSocketConnected) return

    const handleNewNotification = (notif: any) => {
      console.log('NEW NOTIFICATION:', notif)

      queryClient.setQueryData(
        ['notifications', { page: 1, limit: LIMIT }],
        (oldData: any) => {
          // اگر هنوز هیچ دیتایی کش نشده
          if (!oldData) {
            return {
              success: true,
              code: 'NOTIFICATIONS_FETCHED',
              statusCode: 200,
              message: 'Notifications fetched successfully',
              data: {
                notifications: [notif],
                unreadCount: 1,
              },
              meta: {
                page: 1,
                limit: LIMIT,
                total: 1,
                totalPages: 1,
              },
            }
          }

          const prevData = oldData.data ?? {}
          const prevNotifications = prevData.notifications ?? []
          const prevUnreadCount = prevData.unreadCount ?? 0

          const prevMeta = oldData.meta ?? {}
          const prevTotal = prevMeta.total ?? prevNotifications.length

          const newNotifications = [notif, ...prevNotifications].slice(0, LIMIT)

          return {
            ...oldData,
            data: {
              ...prevData,
              notifications: newNotifications,
              unreadCount: prevUnreadCount + 1,
            },
            meta: {
              ...prevMeta,
              total: prevTotal + 1,
              // اگر دوست داری totalPages را هم آپدیت کنی:
              totalPages: Math.max(
                1,
                Math.ceil((prevTotal + 1) / (prevMeta.limit ?? LIMIT))
              ),
            },
          }
        }
      )

      // اینجا mergedNotifications فقط آرایه‌ی نوتیفیکیشن‌هاست، مستقل از ساختار ریسپانس
      setMergedNotifications((prev) => {
        const exists = prev.some((n: any) => n._id === notif._id)
        if (exists) return prev
        return [notif, ...prev]
      })

      setLocalUnreadCount((prev) => prev + 1)
    }

    socket.on('notification:new', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
    }
  }, [socket, isSocketConnected, queryClient])

  const handleReadAll = () => {
    if (isReadAllPending || localUnreadCount === 0) return

    readAllMutate(undefined, {
      onSuccess: () => {
        setLocalUnreadCount(0)

        setMergedNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        )

        queryClient.setQueryData(
          ['notifications', { page: 1, limit: LIMIT }],
          (oldData: any) => {
            if (!oldData?.notifications) return oldData
            return {
              ...oldData,
              notifications: {
                ...oldData.notifications,
                unreadCount: 0,
                notifications: oldData.notifications.notifications?.map(
                  (n: any) => ({ ...n, read: true })
                ),
              },
            }
          }
        )
      },
    })
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      readSingleMutate(
        { notificationId: notification._id },
        {
          onSuccess: () => {
            setLocalUnreadCount((prev) => Math.max(prev - 1, 0))

            setMergedNotifications((prev) =>
              prev.map((n) =>
                n._id === notification._id ? { ...n, read: true } : n
              )
            )

            queryClient.setQueryData(
              ['notifications', { page: 1, limit: LIMIT }],
              (oldData: any) => {
                if (!oldData?.notifications) return oldData

                return {
                  ...oldData,
                  notifications: {
                    ...oldData.notifications,
                    unreadCount: Math.max(
                      (oldData.notifications.unreadCount ?? 1) - 1,
                      0
                    ),
                    notifications: oldData.notifications.notifications?.map(
                      (n: any) =>
                        n._id === notification._id ? { ...n, read: true } : n
                    ),
                  },
                }
              }
            )
          },
        }
      )
    }

    if (notification.task?._id || notification.task) {
      navigate(
        `/workspace/${notification.workspace}/tasks?taskId=${notification.task?._id}`,
        {
          state: { from: location.pathname },
        }
      )
    }
  }

  const handleLoadMore = async () => {
    if (isFetching || !hasMore) return

    if (listRef.current) {
      const container = listRef.current
      ;(container as any).scrollTopBeforeLoad = container.scrollTop
    }

    setIsLoadMore(true)
    setPage((prev) => prev + 1)
    await refetch()
  }

  return (
    <div className='relative flex'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='relative flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring transition-transform '
          >
            <Bell
              size={32}
              className='cursor-pointer text-white rounded-xl p-2 bg-black/90 shadow-sm '
            />
            {localUnreadCount > 0 && (
              <Badge
                variant='destructive'
                className='absolute bg-red-600 -top-1 -right-2 h-4 min-w-4 sm:h-5 sm:min-w-5 px-1 flex items-center justify-center text-[10px] sm:text-xs cursor-pointer hover:bg-red-600 rounded-full shadow'
              >
                {localUnreadCount > 99 ? '99+' : localUnreadCount}
              </Badge>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='mt-2 w-[min(380px,92vw)] max-h-[75vh] overflow-y-scroll rounded-xl p-0 shadow-xl border bg-background/95 backdrop-blur-sm'
          side='bottom'
          align='end'
          sideOffset={8}
        >
          <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='flex sticky top-0 z-40 items-center justify-between gap-2 px-3 py-2.5 border-b bg-white'>
              <div className='flex flex-col gap-0.5'>
                <DropdownMenuLabel className='p-0 text-[13px] sm:text-sm font-semibold'>
                  {t('notifications.title')}
                </DropdownMenuLabel>

                {localUnreadCount > 0 && (
                  <span className='hidden sm:inline-block text-xs text-muted-foreground'>
                    {t('notifications.unreadCount', {
                      count: localUnreadCount,
                    })}
                  </span>
                )}
              </div>

              <div className='flex items-center gap-1 sm:gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={localUnreadCount === 0 || isReadAllPending}
                  onClick={handleReadAll}
                  className={cn(
                    'text-[11px] sm:text-xs px-3 py-2 h-auto whitespace-nowrap flex items-center gap-1',
                    'transition-colors duration-200',
                    !(localUnreadCount === 0 || isReadAllPending) &&
                      'hover:bg-sidebar-accent-foreground/5 hover:shadow-sm',
                    (localUnreadCount === 0 || isReadAllPending) &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Eye className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                  <span>{t('notifications.readAll')}</span>
                </Button>
              </div>
            </div>

            <DropdownMenuSeparator className='m-0' />

            {/* محتوا */}
            <div
              ref={listRef}
              className='flex-1 overflow-y-auto px-2 py-2 space-y-1 scroll-smooth'
            >
              {(isLoading || isError) && (
                <div className='flex flex-col gap-2'>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2'
                    >
                      <Skeleton className='h-8 w-8 rounded-full shrink-0' />
                      <div className='flex flex-col gap-1 w-full'>
                        <Skeleton className='h-3 w-1/2 rounded-full' />
                        <Skeleton className='h-3 w-3/4 rounded-full' />
                        <Skeleton className='h-2 w-1/3 rounded-full mt-1' />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && !isError && mergedNotifications.length === 0 && (
                <div className='flex flex-col items-center justify-center py-6 text-xs text-muted-foreground gap-1 text-center'>
                  <span className='text-base'>📭</span>
                  <span>{t('notifications.empty')}</span>
                </div>
              )}

              {!isLoading &&
                !isError &&
                mergedNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className='p-0 focus:bg-transparent'
                  >
                    <NotificationItemComponent
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  </DropdownMenuItem>
                ))}
            </div>

            {/* Footer */}
            <div className='border-t bg-muted/40 px-3 py-2 flex flex-col gap-1'>
              {hasMore ? (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-[11px] sm:text-xs px-2 py-1 h-auto w-full flex items-center justify-center gap-1'
                  disabled={isFetching}
                  onClick={handleLoadMore}
                >
                  {isFetching ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      <span>{t('notifications.loadingMore')}</span>
                    </>
                  ) : (
                    <span>{t('notifications.showMore')}</span>
                  )}
                </Button>
              ) : (
                totalCount > 0 && (
                  <span className='text-[10px] sm:text-[11px] text-muted-foreground text-center'>
                    {t('notifications.allShown')}
                  </span>
                )
              )}

              {totalCount > 0 && (
                <span className='hidden sm:inline text-[11px] text-muted-foreground self-end'>
                  {t('notifications.showingCount', {
                    shown: formatNumberShort(mergedNotifications.length),
                    total: formatNumberShort(totalCount),
                  })}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Notification
