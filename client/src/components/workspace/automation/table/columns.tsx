import { ColumnDef } from '@tanstack/react-table'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { AutomationItem } from '@/types/automation.type'
import { DataTableColumnHeader } from './table-column-header'
import { Badge } from '@/components/ui/badge'
import { AutomationRowActions } from './table-row-actions'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslation } from 'react-i18next'

export const getColumns = (): ColumnDef<AutomationItem>[] => {
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'type',
      meta: { displayName: t('automations.columns.type') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.type')}
        />
      ),
      cell: ({ row }) => {
        const type = row.original.type

        return (
          <span className='font-medium'>
            {type === 'TASK_REPETITION'
              ? t('automations.types.TASK_REPETITION')
              : t('automations.types.UNKNOWN')}
          </span>
        )
      },
    },

    {
      accessorKey: 'taskId',
      meta: { displayName: t('automations.columns.taskTitle') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.taskTitle')}
        />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.taskId?.title || '-'}
        </span>
      ),
    },

    {
      accessorKey: 'daysOfWeek',
      meta: { displayName: t('automations.columns.daysOfWeek') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.daysOfWeek')}
        />
      ),
      cell: ({ row }) => {
        const days: number[] = row.original.daysOfWeek || []

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
                    {t(`days.${day}`)}
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
      meta: { displayName: t('automations.columns.time') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.time')}
        />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.timeOfDay || '-'}</span>
      ),
    },

    {
      accessorKey: 'nextRunAt',
      meta: { displayName: t('automations.columns.nextRun') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.nextRun')}
        />
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
      meta: { displayName: t('automations.columns.status') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.status')}
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.active ? 'success' : 'destructive'}
          className='px-2 py-1 text-xs'
        >
          {row.original.active
            ? t('automations.status.active')
            : t('automations.status.inactive')}
        </Badge>
      ),
    },

    {
      id: 'actions',
      meta: { displayName: t('automations.columns.actions') },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('automations.columns.actions')}
        />
      ),
      cell: ({ row }) => <AutomationRowActions row={row} />,
    },
  ]
}
