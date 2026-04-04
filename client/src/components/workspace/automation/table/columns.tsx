import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Delete, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { AutomationItem } from '@/types/automation.type'

export const getColumns = ({
  onDelete,
  onEdit,
}: {
  onDelete: (id: string) => void
  onEdit: (automation: AutomationItem) => void
}): ColumnDef<AutomationItem>[] => {
  return [
    {
      accessorKey: 'type',
      header: 'نوع',
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <span>
            {type === 'TASK_REPETITION' ? 'تکرار وظایف' : 'نوع نامشخص'}
          </span>
        )
      },
    },
    {
      accessorKey: 'taskId',
      header: 'شناسه وظیفه',
      cell: ({ row }) => row.original.taskId,
    },
    {
      accessorKey: 'daysOfWeek',
      header: 'روزهای هفته',
      cell: ({ row }) => {
        const days = row.original.daysOfWeek || []
        const dayNames = [
          'یکشنبه',
          'دوشنبه',
          'سه‌شنبه',
          'چهارشنبه',
          'پنجشنبه',
          'جمعه',
          'شنبه',
        ]
        return days.map((day) => dayNames[day]).join(', ')
      },
    },
    {
      accessorKey: 'timeOfDay',
      header: 'زمان',
      cell: ({ row }) => row.original.timeOfDay,
    },
    {
      accessorKey: 'timezone',
      header: 'منطقه زمانی',
      cell: ({ row }) => row.original.timezone,
    },
    {
      accessorKey: 'nextRunAt',
      header: 'اجرای بعدی',
      cell: ({ row }) => {
        return format(new Date(row.original.nextRunAt), 'PPp', { locale: faIR })
      },
    },
    {
      accessorKey: 'active',
      header: 'وضعیت',
      cell: ({ row }) => (
        <span
          className={row.original.active ? 'text-green-500' : 'text-red-500'}
        >
          {row.original.active ? 'فعال' : 'غیرفعال'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'عملیات',
      cell: ({ row }) => (
        <div className='flex space-x-1 rtl:space-x-reverse'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onEdit(row.original)}
          >
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => onDelete(row.original._id)}
          >
            <Delete className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ]
}
