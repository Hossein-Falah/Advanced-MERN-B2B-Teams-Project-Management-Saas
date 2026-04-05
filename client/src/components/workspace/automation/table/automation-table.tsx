import { FC, useState } from 'react'
import { DataTable } from './table'
import { useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DataTableFacetedFilter } from './table-faceted-filter'
import { statuses } from './data'
import { useQuery } from '@tanstack/react-query'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { getAllAutomationsQueryFn } from '@/lib/api/automation'
import { AutomationItem } from '@/types/automation.type'
import { getColumns } from './columns'

type Filters = {
  keyword: string | null
  status: string | null
}

type SetFilters = (filters: Filters) => void

interface DataTableFilterToolbarProps {
  isLoading?: boolean
  filters: Filters
  setFilters: SetFilters
  resetAllFilters: () => void
}

const AutomationTable = () => {
  const [searchParams] = useSearchParams()
  const automationId = searchParams.get('automationId')

  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationItem | null>(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<Filters>({
    keyword: null,
    status: null,
  })

  const workspaceId = useWorkspaceId()
  const columns = getColumns({})

  const resetAllFilters = () => {
    setFilters({
      keyword: null,
      status: null,
    })
    if (automationId) {
      searchParams.delete('automationId')
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: [
      'all-automations',
      workspaceId,
      pageSize,
      pageNumber,
      filters,
      automationId,
    ],
    queryFn: () =>
      getAllAutomationsQueryFn({
        workspaceId,
        page: pageNumber,
        limit: pageSize,
      }),
    staleTime: 0,
  })

  const automations: AutomationItem[] = data?.data || []
  const totalCount = data?.pagination.total || 0

  const handlePageChange = (page: number) => setPageNumber(page)
  const handlePageSizeChange = (size: number) => setPageSize(size)

  return (
    <div className='w-full relative' dir='rtl'>
      <DataTable
        isLoading={isLoading}
        data={automations}
        columns={columns}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pagination={{
          totalCount,
          pageNumber,
          pageSize,
        }}
        filtersToolbar={
          <DataTableFilterToolbar
            isLoading={isLoading}
            filters={filters}
            setFilters={setFilters}
            resetAllFilters={resetAllFilters}
          />
        }
      />

      {/* Edit Dialog Placeholder */}
      {selectedAutomation && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-4 rounded-lg'>
            <h2>ویرایش اتومیشن</h2>
            <pre>{JSON.stringify(selectedAutomation, null, 2)}</pre>
            <Button onClick={() => setSelectedAutomation(null)}>بستن</Button>
          </div>
        </div>
      )}
    </div>
  )
}

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  filters,
  setFilters,
  resetAllFilters,
}) => {
  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters({
      ...filters,
      [key]: values.length > 0 ? values.join(',') : null,
    })
  }

  return (
    <div className='flex flex-col lg:flex-row w-full items-start space-y-2 mb-2 lg:mb-0 lg:space-x-2 lg:space-y-0 rtl:space-x-reverse'>
      <Input
        placeholder='فیلتر اتومیشن‌ها ...'
        value={filters.keyword || ''}
        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        className='h-8 w-full lg:w-[250px]'
      />

      <DataTableFacetedFilter
        title='وضعیت'
        multiSelect={true}
        options={statuses}
        disabled={isLoading}
        selectedValues={filters.status?.split(',') || []}
        onFilterChange={(values) => handleFilterChange('status', values)}
      />

      {(filters.keyword || filters.status) && (
        <Button
          disabled={isLoading}
          variant='ghost'
          className='h-8 px-2 lg:px-3'
          onClick={resetAllFilters}
        >
          بازنشانی
          <X />
        </Button>
      )}
    </div>
  )
}

export default AutomationTable
