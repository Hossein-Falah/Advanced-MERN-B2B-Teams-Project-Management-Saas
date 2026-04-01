import { NotificationItem } from '@/types/notification.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: NotificationItem
  onClick?: (notification: NotificationItem) => void
}

const NotificationItemComponent = ({
  notification,
  onClick,
}: NotificationItemProps) => {
  const { type, sender, task, createdAt, read } = notification

  const createdDate = new Date(createdAt)
  const timeString = createdDate.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateString = createdDate.toLocaleDateString('fa-IR')

  const senderName = sender?.username || sender?.name || 'کاربر'
  const senderInitials = getAvatarFallbackText(senderName)
  const senderColor = getAvatarColor(senderName)

  const notificationTitles: Record<string, (name: string) => string> = {
    TASK_ASSIGNED: (name) => `${name} یک وظیفه به شما اختصاص داد`,
    TASK_UPDATED: (name) => `${name} یک وظیفه را بروزرسانی کرد`,
    MENTION: (name) => `${name} شما را منشن کرد`,
  }

  const title = notificationTitles[type]?.(senderName) ?? 'نوتیفیکیشن جدید'

  const description =
    task?.description || 'برای جزئیات بیشتر، روی این نوتیفیکیشن کلیک کنید.'

  return (
    <button
      type='button'
      onClick={() => onClick?.(notification)}
      className={cn(
        'w-full text-right flex items-start gap-3 rounded-lg border p-3 transition-colors',
        'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !read
          ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          : 'bg-background border-transparent',
      )}
    >
      <Avatar className='h-9 w-9 flex-shrink-0'>
        <AvatarImage src={sender?.profilePicture || ''} alt={senderName} />
        <AvatarFallback className={senderColor}>
          {senderInitials}
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col gap-1 flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-sm font-medium line-clamp-1'>{title}</p>

          {!read && (
            <span className='h-2 w-2 rounded-full bg-blue-500 flex-shrink-0' />
          )}
        </div>

        <p className='text-xs text-muted-foreground line-clamp-2'>
          {description}
        </p>

        <div className='mt-1 flex items-center justify-between text-[11px] text-muted-foreground'>
          {task?.title ? (
            <span className='line-clamp-1 max-w-[60%]'>
              وظیفه: {task.title}
            </span>
          ) : (
            <span />
          )}

          <span>
            {dateString} - {timeString}
          </span>
        </div>
      </div>
    </button>
  )
}

export default NotificationItemComponent
