// src/components/task-logs/logs-list.tsx
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { cn } from '@/lib/utils'
import { LogsListProps } from '@/types/task-logs.type'

const LogsList = ({
  logs,
  selectedLogId,
  onSelectLog,
  isLoading,
}: LogsListProps) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          'max-h-[420px] overflow-y-auto rounded-2xl border',
          'bg-white/80 dark:bg-slate-950/90 p-3 space-y-2.5',
        )}
        dir='rtl'
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='rounded-xl border px-3.5 py-3 bg-slate-50/80 dark:bg-slate-900/80 animate-pulse space-y-2'
          >
            <div className='flex items-center justify-between mb-1.5'>
              <div className='flex items-center gap-2'>
                <div className='h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700' />
                <div className='h-3 w-24 rounded bg-slate-200 dark:bg-slate-700' />
              </div>
              <div className='h-3 w-20 rounded bg-slate-200 dark:bg-slate-700' />
            </div>

            <div className='flex justify-between items-center'>
              <div className='h-3 w-16 rounded bg-slate-200 dark:bg-slate-700' />
              <div className='h-3 w-10 rounded bg-slate-200 dark:bg-slate-700' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center rounded-2xl border',
          'bg-gradient-to-b from-background to-muted/40',
          'px-4 py-8 text-xs sm:text-sm text-muted-foreground text-center',
        )}
        dir='rtl'
      >
        هنوز تاریخچه‌ای برای این وظیفه ثبت نشده است.
      </div>
    )
  }

  return (
    <div
      className={cn(
        'max-h-[420px] overflow-y-auto rounded-2xl border',
        'bg-white/80 dark:bg-slate-950/90 p-3 space-y-2.5',
      )}
      dir='rtl'
    >
      {logs.map((log) => {
        const name = log.user?.name || ''
        const initials = getAvatarFallbackText(name)
        const avatarColor = getAvatarColor(name)
        const isActive = selectedLogId === log._id

        const actionLabel =
          log.action === 'CREATE'
            ? 'ایجاد وظیفه '
            : log.action === 'UPDATE'
              ? 'ویرایش وظیفه '
              : log.action === 'DELETE'
                ? 'حذف وظیفه '
                : 'اقدام'

        const formattedDate = formatJalali(
          new Date(log.createdAt),
          'PPP HH:mm',
          {
            locale: faIR,
          },
        )

        return (
          <button
            key={log._id}
            type='button'
            onClick={() => onSelectLog(log)}
            className={cn(
              'w-full text-right flex flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-xs sm:text-sm transition-all',
              'bg-slate-50/50 dark:bg-slate-900/60',
              'hover:bg-slate-100/80 dark:hover:bg-slate-800/80',
              'hover:border-primary/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
              'group',
              isActive &&
                'border-primary/10 bg-primary/5 dark:bg-primary/10 shadow-md',
            )}
          >
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                {name && (
                  <>
                    <Avatar
                      toUser={log.user.username}
                      className='h-7 w-7 shrink-0 border border-border'
                    >
                      <AvatarImage
                        src={log.user.profilePicture || ''}
                        alt={name}
                      />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex flex-col min-w-0'>
                      <span className='truncate max-w-[140px] text-xs sm:text-sm font-medium'>
                        {name}
                      </span>
                      <span className='text-[10px] text-muted-foreground truncate max-w-[160px]'>
                        {formattedDate}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <span className='text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap ms-2'>
                {log.changes?.length || 0} تغییر
              </span>
            </div>

            <div className='flex items-center justify-between text-[11px] sm:text-xs'>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
                  'bg-white/80 dark:bg-slate-950/80 border text-[11px]',
                  isActive
                    ? 'border-primary/40 text-primary'
                    : 'border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200',
                )}
              >
                <span className='inline-block h-1.5 w-1.5 rounded-full bg-primary/70' />
                {actionLabel}
              </span>

              <span className='text-[10px] text-muted-foreground'>
                #{log._id.slice(-4)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default LogsList
