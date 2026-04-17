import { NotificationItem } from '@/types/notification.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface NotificationItemProps {
  notification: NotificationItem
  onClick?: (notification: NotificationItem) => void
}

const NotificationItemComponent = ({
  notification,
  onClick,
}: NotificationItemProps) => {
  const { t } = useTranslation()
  const { type, sender, task, createdAt, read } = notification

  const createdDate = new Date(createdAt)
  const timeString = createdDate.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateString = createdDate.toLocaleDateString('fa-IR')

  const senderName =
    sender?.username || sender?.name || t('notifications.item.defaultUser')

  const senderInitials = getAvatarFallbackText(senderName)
  const senderColor = getAvatarColor(senderName)

  const notificationTitleKeyMap: Record<string, string> = {
    TASK_ASSIGNED: 'notifications.item.title.taskAssigned',
    TASK_UPDATED: 'notifications.item.title.taskUpdated',
    MENTION: 'notifications.item.title.mention',
  }

  const titleKey =
    notificationTitleKeyMap[type] || 'notifications.item.title.default'

  const title = t(titleKey, {
    name: senderName,
  })

  const description =
    task?.description || t('notifications.item.description.default')

  return (
    <button
      type='button'
      onClick={() => onClick?.(notification)}
      className={cn(
        'w-full text-right flex items-start gap-3 rounded-lg border p-3 transition-colors',
        'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !read
          ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          : 'bg-background border-transparent'
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
              {t('notifications.item.taskLabel')} {task.title}
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
