import { ColumnDef } from '@tanstack/react-table'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { AutomationItem } from '@/types/automation.type'
import { DataTableColumnHeader } from './table-column-header'
import { Badge } from '@/components/ui/badge'
import { AutomationRowActions } from './table-row-actions'
import { useIsMobile } from '@/hooks/use-mobile'

export const getColumns = ({}: {}): ColumnDef<AutomationItem>[] => {
  const isMobile = useIsMobile()
  return [
    {
      accessorKey: 'type',
      meta: { displayName: 'نوع' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='نوع' />
      ),
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <span className='font-medium'>
            {type === 'TASK_REPETITION' ? 'تکرار خودکار وظیفه' : 'نوع نامشخص'}
          </span>
        )
      },
    },

    {
      accessorKey: 'taskId',
      meta: { displayName: 'عنوان وظیفه' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='عنوان وظیفه' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.taskId.title || '-'}
        </span>
      ),
    },

    {
      accessorKey: 'daysOfWeek',
      meta: { displayName: 'روزهای هفته' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='روزهای هفته' />
      ),
      cell: ({ row }) => {
        const days = row.original.daysOfWeek || []

        const names = [
          'شنبه',
          'یکشنبه',
          'دوشنبه',
          'سه‌شنبه',
          'چهارشنبه',
          'پنجشنبه',
          'جمعه',
        ]

        const MAX_VISIBLE = isMobile ? 2 : 5
        const visibleDays = days.slice(0, MAX_VISIBLE)
        const remaining = days.length - MAX_VISIBLE

        return (
          <div className='flex flex-wrap items-center gap-1 min-w-44'>
            {days.length > 0 ? (
              <>
                {visibleDays.map((day) => (
                  <Badge
                    key={day}
                    variant='secondary'
                    className='px-2 py-0.5 text-xs whitespace-nowrap'
                  >
                    {names[day]}
                  </Badge>
                ))}

                {remaining > 0 && (
                  <Badge
                    variant='outline'
                    className='px-2 py-0.5 text-xs whitespace-nowrap'
                  >
                    +{remaining}
                  </Badge>
                )}
              </>
            ) : (
              <span className='text-muted-foreground'>—</span>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: 'timeOfDay',
      meta: { displayName: 'زمان' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='زمان اجرا' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.timeOfDay || '-'}</span>
      ),
    },

    {
      accessorKey: 'nextRunAt',
      meta: { displayName: 'اجرای بعدی' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='اجرای بعدی' />
      ),
      cell: ({ row }) => {
        if (!row.original.nextRunAt) return '—'
        return formatJalali(new Date(row.original.nextRunAt), 'd MMMM HH:mm', {
          locale: faIR,
        })
      },
    },

    {
      accessorKey: 'active',
      meta: { displayName: 'وضعیت' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='وضعیت' />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.active ? 'success' : 'destructive'}
          className='px-2 py-1 text-xs'
        >
          {row.original.active ? 'فعال' : 'غیرفعال'}
        </Badge>
      ),
    },

    {
      id: 'actions',
      meta: { displayName: 'عملیات' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='عملیات' />
      ),
      cell: ({ row }) => <AutomationRowActions row={row} />,
    },
  ]
}
