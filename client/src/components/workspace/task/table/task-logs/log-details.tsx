// src/components/task-logs/log-details.tsx
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Button } from '@/components/ui/button'
import { LogDetailsProps } from '@/types/task-logs.type'
import {
  fieldLabelMap,
  renderLogFieldValue,
} from '@/components/workspace/task/table/task-logs/renderLogFieldValue'
import { cn } from '@/lib/utils'

const LogDetails = ({
  log,
  task,
  onUndo,
  onRedo,
  isUndoLoading,
  isRedoLoading,
}: LogDetailsProps) => {
  if (!log) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center rounded-2xl border',
          'bg-gradient-to-b from-background to-muted/40',
          'px-4 py-8 text-xs sm:text-sm text-muted-foreground text-center',
        )}
        dir='rtl'
      >
        برای مشاهده جزئیات، یکی از لاگ‌ها را از لیست سمت راست انتخاب کنید.
      </div>
    )
  }

  const canUndo = !log.isUndone
  const canRedo = log.isUndone

  const formattedDate = formatJalali(new Date(log.createdAt), 'PPP HH:mm', {
    locale: faIR,
  })

  return (
    <div
      className={cn(
        'w-full h-full max-h-[420px] rounded-2xl border',
        'bg-white/80 dark:bg-slate-950/90',
        'backdrop-blur-sm',
        'flex flex-col overflow-hidden',
      )}
      dir='rtl'
    >
      {/* هدر */}
      <div
        className={cn(
          'border-b px-4 sm:px-5 py-3.5 sm:py-4',
          'bg-slate-50/60 dark:bg-slate-900/60',
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        )}
      >
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='h-6 w-1 rounded-full bg-primary/70' />
            <p className='text-sm sm:text-[15px] font-semibold'>
              جزئیات تغییرات
            </p>
          </div>

          <p className='text-[11px] sm:text-xs text-muted-foreground leading-5 '>
            این تغییرات توسط{' '}
            <span className='font-medium text-foreground leading-5'>
              {log.user?.name || 'کاربر'}
            </span>{' '}
            در <span className='font-semibold leading-5'>{formattedDate}</span>{' '}
            ثبت شده‌اند.
          </p>
        </div>

        {/* اکشن‌ها */}
        <div className='flex items-center gap-2 justify-end'>
          <Button
            variant='outline'
            size='sm'
            className={cn(
              'h-[32px] text-xs sm:text-[13px] px-3',
              'flex items-center gap-1.5',
            )}
            disabled={isUndoLoading || !canUndo}
            onClick={() => onUndo(log._id)}
          >
            {isUndoLoading ? (
              <span>در حال بازگردانی...</span>
            ) : (
              <>
                <span className='hidden sm:inline'>بازگردانی</span>
                <span className='sm:hidden'>بازگشت</span>
              </>
            )}
          </Button>

          <Button
            size='sm'
            className={cn(
              'h-[32px] text-xs sm:text-[13px] px-3',
              'flex items-center gap-1.5',
            )}
            variant='outline'
            disabled={isRedoLoading || !canRedo}
            onClick={() => onRedo(log._id)}
          >
            {isRedoLoading ? (
              <span>در حال اعمال...</span>
            ) : (
              <>
                <span className='hidden sm:inline'>اعمال مقدار جدید</span>
                <span className='sm:hidden'>اعمال</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* لیست تغییرات */}
      <div className='flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-3.5 space-y-2.5 pr-1 custom-scrollbar'>
        {log.changes?.map((change, index) => (
          <div
            key={change._id}
            className={cn(
              'rounded-xl border px-3.5 py-3 bg-slate-50/70 dark:bg-slate-900/70',
              'shadow-[0_0_0_1px_rgba(15,23,42,0.02)]',
            )}
          >
            {/* عنوان فیلد + شماره تغییر */}
            <div className='flex items-center justify-between gap-2 mb-2.5'>
              <p className='text-[11px] sm:text-xs font-semibold flex items-center gap-1.5'>
                <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary'>
                  {index + 1}
                </span>
                <span>{fieldLabelMap[change.field] || change.field}</span>
              </p>

              <span className='text-[10px] text-muted-foreground'>
                تغییر {change.oldValue ? 'ویرایشی' : 'ایجادی'}
              </span>
            </div>

            {/* مقادیر قبلی / جدید */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] sm:text-xs'>
              <div className='space-y-1.5'>
                <p className='text-[10px] text-muted-foreground flex items-center gap-1'>
                  <span className='inline-block h-1.5 w-1.5 rounded-full bg-amber-500/80' />
                  مقدار قبلی
                </p>
                <div
                  className={cn(
                    'rounded-lg border bg-white/80 dark:bg-slate-950/50',
                    'px-2.5 py-1.5 min-h-[32px] flex items-center break-all',
                  )}
                >
                  {renderLogFieldValue(change.field, change.oldValue, { task })}
                </div>
              </div>

              <div className='space-y-1.5'>
                <p className='text-[10px] text-muted-foreground flex items-center gap-1'>
                  <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/80' />
                  مقدار جدید
                </p>
                <div
                  className={cn(
                    'rounded-lg border bg-emerald-50/60 dark:bg-emerald-900/10',
                    'px-2.5 py-1.5 min-h-[32px] flex items-center break-all',
                  )}
                >
                  {renderLogFieldValue(change.field, change.newValue, { task })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!log.changes || log.changes.length === 0) && (
          <div className='text-[11px] text-muted-foreground text-center py-6 rounded-xl border border-dashed bg-muted/40'>
            تغییری برای این لاگ ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  )
}

export default LogDetails
