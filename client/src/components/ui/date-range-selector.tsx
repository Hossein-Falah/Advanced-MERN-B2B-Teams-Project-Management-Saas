'use client'

import * as React from 'react'
import {
  format as formatJalali,
  subDays,
  startOfWeek,
  endOfWeek,
  subMonths,
} from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { DateRange as DayPickerDateRange } from 'react-day-picker'

export type DateRange = {
  startDate: Date
  endDate: Date
}

interface JalaliDateRangeSelectorProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const formatJalaliRange = (start: Date, end: Date): string => {
  const startStr = formatJalali(start, 'yyyy/MM/dd', { locale: faIR })
  const endStr = formatJalali(end, 'yyyy/MM/dd', { locale: faIR })
  return `${startStr} — ${endStr}`
}

const predefinedRanges = [
  {
    label: '۷ روز اخیر',
    get: () => ({ startDate: subDays(new Date(), 6), endDate: new Date() }),
  },
  {
    label: '۳۰ روز اخیر',
    get: () => ({ startDate: subDays(new Date(), 29), endDate: new Date() }),
  },
  {
    label: 'این هفته',
    get: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 6 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 6 }),
    }),
  },
  {
    label: 'ماه قبل',
    get: () => ({ startDate: subMonths(new Date(), 1), endDate: new Date() }),
  },
]

export function DateRangeSelector({
  value,
  onChange,
  className,
}: JalaliDateRangeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<
    DayPickerDateRange | undefined
  >({
    from: value.startDate,
    to: value.endDate,
  })

  const handleRangeSelect = (range: DayPickerDateRange | undefined) => {
    setTempRange(range)
  }

  const applyRange = () => {
    if (tempRange?.from && tempRange?.to) {
      onChange({ startDate: tempRange.from, endDate: tempRange.to })
      setOpen(false)
    }
  }

  const cancel = () => {
    setTempRange({ from: value.startDate, to: value.endDate })
    setOpen(false)
  }

  const selectPreset = (preset: (typeof predefinedRanges)[0]) => {
    const range = preset.get()
    setTempRange({ from: range.startDate, to: range.endDate })
    onChange(range) // اعمال فوری
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'flex items-center gap-2 px-3 h-9 text-sm font-normal',
            className
          )}
        >
          <CalendarIcon className='h-4 w-4 ' />
          <span className='truncate '>
            {formatJalaliRange(value.startDate, value.endDate)}
          </span>
          <ChevronDown className='h-4 w-4 opacity-60' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end' dir='rtl'>
        <div className='p-3 border-b'>
          <div className='flex flex-wrap gap-2'>
            {predefinedRanges.map((preset) => (
              <Button
                key={preset.label}
                variant='secondary'
                size='sm'
                onClick={() => selectPreset(preset)}
                className='text-xs h-7'
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <div className=''>
          <Calendar
            mode='range'
            selected={tempRange}
            onSelect={handleRangeSelect}
            locale={faIR}
            className='rounded-md flex justify-center items-center '
          />
        </div>
        <div className='flex justify-end gap-2 p-3 border-t'>
          <Button variant='outline' size='sm' onClick={cancel}>
            لغو
          </Button>
          <Button
            size='sm'
            onClick={applyRange}
            disabled={!tempRange?.from || !tempRange?.to}
          >
            اعمال
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
