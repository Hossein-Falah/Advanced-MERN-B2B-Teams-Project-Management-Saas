import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageNumber: number
  pageSize: number
  totalCount: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function DataTablePagination<TData>({
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation()

  const pageCount = Math.ceil(totalCount / pageSize)

  return (
    <div className='flex items-center justify-between px-2'>
      <div className='flex items-center space-x-2 rtl:space-x-reverse'>
        <p className='text-sm font-medium'>
          {t('automations.table.pageInfo', {
            page: pageNumber,
            total: pageCount,
          })}
        </p>

        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            onPageSizeChange?.(Number(value))
          }}
        >
          <SelectTrigger className='h-8 w-[70px]'>
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>

          <SelectContent>
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex space-x-2 rtl:space-x-reverse'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange?.(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
        >
          {t('automations.table.previous')}
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange?.(Math.min(pageCount, pageNumber + 1))}
          disabled={pageNumber >= pageCount}
        >
          {t('automations.table.next')}
        </Button>
      </div>
    </div>
  )
}
