// src/components/common/jalali-date-selector.tsx
import * as React from 'react'
import { format as formatJalali, addDays, subDays } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next' // یا از next-i18next

type JalaliDateSelectorProps = {
  /**
   * مقدار فعلی به فرمت YYYY-MM-DD (ایزو ساده که به سرور می‌فرستی)
   */
  value: string
  /**
   * وقتی تاریخ عوض شد: مقدار جدید به فرمت YYYY-MM-DD برمی‌گرده
   */
  onChange: (next: string) => void
  /**
   * لیبل کنار فیلد (مثلاً "تاریخ گزارش")
   */
  label?: string
  /**
   * اگر بخوای کلش رو disable کنی
   */
  disabled?: boolean
}

const toIsoDateString = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const parseIsoDate = (value: string | undefined | null): Date => {
  if (!value) return new Date()
  // مرورگرها Date('YYYY-MM-DD') رو UTC می‌گیرن، برای جلوگیری از اختلاف ساعت:
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export const JalaliDateSelector: React.FC<JalaliDateSelectorProps> = ({
  value,
  onChange,
  label = '',
  disabled,
}) => {
  const { t } = useTranslation()

  const selectedDate = React.useMemo(() => parseIsoDate(value), [value])

  const handleChangeDate = (date: Date | undefined) => {
    if (!date) return
    onChange(toIsoDateString(date))
  }

  const goPrevDay = () => {
    const prev = subDays(selectedDate, 1)
    onChange(toIsoDateString(prev))
  }

  const goNextDay = () => {
    const next = addDays(selectedDate, 1)
    onChange(toIsoDateString(next))
  }

  return (
    <div className='flex flex-col gap-1'>
      {label && (
        <span className='text-xs font-medium text-gray-700 dark:text-gray-200'>
          {label}
        </span>
      )}

      <div className='flex items-center gap-2'>
        {/* دکمه روز قبل */}
        <Button
          type='button'
          size='icon'
          variant='outline'
          className='h-8 w-8'
          onClick={goNextDay}
          disabled={disabled}
        >
          {/* چون RTL هستیم، آیکن چپ یعنی "قبل" */}
          <ChevronRight className='w-4 h-4' />
        </Button>

        {/* پاپ‌اور انتخاب تاریخ */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className={cn(
                'flex-1 h-9 justify-between px-3 text-right text-xs font-normal',
                !value && 'text-muted-foreground'
              )}
              disabled={disabled}
            >
              <span className='truncate'>
                {selectedDate
                  ? formatJalali(selectedDate, 'PPP', { locale: faIR })
                  : t('ui.datePicker.placeholder')}
              </span>
              <CalendarIcon className='mr-2 h-4 w-4 opacity-60' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align='center'
            className='w-auto p-0'
            side='bottom'
            dir='rtl'
          >
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={handleChangeDate}
              initialFocus
              locale={faIR}
            />
          </PopoverContent>
        </Popover>

        {/* دکمه روز بعد */}
        <Button
          type='button'
          size='icon'
          variant='outline'
          className='h-8 w-8'
          onClick={goPrevDay}
          disabled={disabled}
        >
          {/* در RTL، این میشه "بعد" */}
          <ChevronLeft className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}
