import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Eye, Loader2 } from 'lucide-react'

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
  const { socket, isSocketConnected } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [mergedNotifications, setMergedNotifications] = useState<any[]>([])
  const [isLoadMore, setIsLoadMore] = useState(false)

  // ✅ شمارنده‌ی محلی نوتیف‌های خوانده‌نشده
  const [localUnreadCount, setLocalUnreadCount] = useState<number>(0)

  // ref برای مدیریت اسکرول
  const listRef = useRef<HTMLDivElement | null>(null)

  const { data, isLoading, isError, refetch, isFetching } = useNotifications({
    page,
    limit: LIMIT,
  })

  const { mutate: readAllMutate, isPending: isReadAllPending } =
    useReadAllNotifications()
  const { mutate: readSingleMutate } = useReadSingleNotification()

  const totalCount = data?.notifications?.pagination?.total ?? 0
  const hasMore = mergedNotifications.length < totalCount

  // ✅ سینک اولیه‌ی localUnreadCount با API
  useEffect(() => {
    if (data?.notifications?.unreadCount != null) {
      setLocalUnreadCount(data.notifications.unreadCount)
    }
  }, [data?.notifications?.unreadCount])

  // همگام‌سازی data هر صفحه با mergedNotifications
  useEffect(() => {
    if (!data?.notifications?.notifications) return

    setMergedNotifications((prev) => {
      if (page === 1) {
        // بار اول یا رفرش
        return data.notifications.notifications
      }

      // در صفحه‌های بعدی append بدون تکرار
      const existingIds = new Set(prev.map((n: any) => n._id))
      const newItems = data.notifications.notifications.filter(
        (n: any) => !existingIds.has(n._id),
      )

      return [...prev, ...newItems]
    })

    // بعد از load more، اسکرول را اصلاح کن
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

  // ساب‌اسکرایب وب‌سوکت + آپدیت شمارنده محلی
  useEffect(() => {
    if (!socket || !isSocketConnected) return

    const handleNewNotification = (notif: any) => {
      console.log('NEW NOTIFICATION:', notif)

      // 1) آپدیت کش صفحه 1 (در صورت سازگار بودن key)
      queryClient.setQueryData(
        ['notifications', { page: 1, limit: LIMIT }],
        (oldData: any) => {
          if (!oldData?.notifications) {
            return {
              notifications: {
                notifications: [notif],
                unreadCount: 1,
                pagination: { total: 1 },
              },
            }
          }

          const prev = oldData.notifications

          return {
            ...oldData,
            notifications: {
              ...prev,
              notifications: [notif, ...(prev.notifications ?? [])].slice(
                0,
                LIMIT,
              ),
              unreadCount: (prev.unreadCount ?? 0) + 1,
              pagination: {
                ...prev.pagination,
                total:
                  prev.pagination?.total != null
                    ? prev.pagination.total + 1
                    : (prev.notifications?.length ?? 0) + 1,
              },
            },
          }
        },
      )

      // 2) آپدیت آرایه‌ی محلی برای UI
      setMergedNotifications((prev) => {
        const exists = prev.some((n: any) => n._id === notif._id)
        if (exists) return prev
        return [notif, ...prev]
      })

      // 3) ✅ افزایش شمارنده‌ی محلی
      setLocalUnreadCount((prev) => prev + 1)
    }

    socket.on('notification:new', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
    }
  }, [socket, isSocketConnected, queryClient])

  // ✅ خواندن همه → صفر کردن شمارنده‌ی محلی + sync کش و لیست
  const handleReadAll = () => {
    if (isReadAllPending || localUnreadCount === 0) return

    readAllMutate(undefined, {
      onSuccess: () => {
        setLocalUnreadCount(0)

        // لیست محلی را به read تبدیل کن
        setMergedNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true })),
        )

        // کش ریکت‌کوئری را هم آپدیت کن
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
                  (n: any) => ({ ...n, read: true }),
                ),
              },
            }
          },
        )
      },
    })
  }

  // ✅ خواندن تکی → 1 دونه از شمارنده کم کن + sync کش و لیست
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      readSingleMutate(
        { notificationId: notification._id },
        {
          onSuccess: () => {
            setLocalUnreadCount((prev) => Math.max(prev - 1, 0))

            // در آرایه‌ی محلی، read را true کنیم
            setMergedNotifications((prev) =>
              prev.map((n) =>
                n._id === notification._id ? { ...n, read: true } : n,
              ),
            )

            // کش ریکت‌کوئری را هم آپدیت کن
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
                      0,
                    ),
                    notifications: oldData.notifications.notifications?.map(
                      (n: any) =>
                        n._id === notification._id ? { ...n, read: true } : n,
                    ),
                  },
                }
              },
            )
          },
        },
      )
    }

    if (notification.task?._id || notification.task) {
      navigate(
        `/workspace/${notification.workspace}/tasks?taskId=${notification.task?._id}`,
        {
          state: { from: location.pathname },
        },
      )
    }
  }

  const handleLoadMore = async () => {
    if (isFetching || !hasMore) return

    if (listRef.current) {
      const container = listRef.current
      // موقعیت اسکرول قبل از لود
      ;(container as any).scrollTopBeforeLoad = container.scrollTop
    }

    setIsLoadMore(true)
    setPage((prev) => prev + 1)
    // اگر useNotifications بر اساس page key تغییر می‌کند، refetch لازم نیست
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
            {/* ✅ استفاده از localUnreadCount برای Badge */}
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
                  نوتیفیکیشن‌ها
                </DropdownMenuLabel>
                {/* برای متن توضیحی می‌تونی از apiUnreadCount یا localUnreadCount استفاده کنی؛ من local رو گذاشتم که همیشه sync باشه */}
                {localUnreadCount > 0 && (
                  <span className='hidden sm:inline-block text-xs text-muted-foreground'>
                    {localUnreadCount} نوتیف خوانده‌نشده
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
                      'opacity-50 cursor-not-allowed',
                  )}
                >
                  <Eye className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                  <span>خواندن همه</span>
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
                  <span>فعلاً نوتیفیکیشنی نداری.</span>
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

            {/* Footer: UX بهتر برای Load more */}
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
                      <span>در حال بارگذاری نوتیف‌های بیشتر...</span>
                    </>
                  ) : (
                    <span>نمایش نوتیف‌های بیشتر</span>
                  )}
                </Button>
              ) : (
                totalCount > 0 && (
                  <span className='text-[10px] sm:text-[11px] text-muted-foreground text-center'>
                    همه نوتیف‌ها نمایش داده شدند
                  </span>
                )
              )}

              {totalCount > 0 && (
                <span className='hidden sm:inline text-[11px] text-muted-foreground self-end'>
                  {formatNumberShort(mergedNotifications.length)} از{' '}
                  {formatNumberShort(totalCount)} نوتیف
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
