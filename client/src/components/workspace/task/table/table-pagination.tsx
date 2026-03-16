import { Table } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageNumber: number
  pageSize: number
  totalCount: number // مجموع ردیف‌ها از API
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function DataTablePagination<TData>({
  table,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  //const pageSize = table.getState().pagination.pageSize;
  const pageCount = Math.ceil(totalCount / pageSize)

  const handlePageSizeChange = (size: number) => {
    table.setPageSize(size)
    onPageSizeChange?.(size)
  }

  const handlePageChange = (index: number) => {
    table.setPageIndex(index)
    onPageChange?.(index + 1)
  }

  const start = (pageNumber - 1) * pageSize + 1
  const end = Math.min(pageNumber * pageSize, totalCount)

  return (
    <div
      className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2'
      dir='rtl'
    >
      {/* نمایش X تا Y از Z ردیف */}
      <div className='flex-1 text-sm text-muted-foreground'>
        نمایش {start} تا {end} از {totalCount}
      </div>
      <div className='flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-x-8 lg:space-y-0 rtl:space-x-reverse'>
        {/* انتخاب تعداد ردیف در هر صفحه */}
        <div className='flex items-center space-x-2 rtl:space-x-reverse'>
          <p className='text-sm font-medium'>تعداد ردیف در هر صفحه</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* اطلاعات صفحه و کنترل‌ها */}
        <div className='flex items-center'>
          <div className='flex lg:w-[100px] items-center justify-center text-sm font-medium'>
            صفحه {pageIndex + 1} از {pageCount}
          </div>

          {/* دکمه‌های صفحه‌بندی */}
          <div className='flex items-center space-x-2 rtl:space-x-reverse'>
            <Button
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => handlePageChange(0)}
              disabled={pageIndex === 0}
            >
              <span className='sr-only'>رفتن به صفحه اول</span>
              <ChevronsRight />
            </Button>
            <Button
              variant='outline'
              onClick={() => handlePageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <span className='sr-only'>رفتن به صفحه قبل</span>
              <ChevronRight />
              قبلی
            </Button>
            <Button
              variant='outline'
              onClick={() => handlePageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <span className='sr-only'>رفتن به صفحه بعد</span>
              بعدی
              <ChevronLeft />
            </Button>
            <Button
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <span className='sr-only'>رفتن به صفحه آخر</span>
              <ChevronsLeft />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
