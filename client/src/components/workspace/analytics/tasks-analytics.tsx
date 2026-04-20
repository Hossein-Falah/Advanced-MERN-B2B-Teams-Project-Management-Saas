import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { CalendarDays, CalendarPlus, CheckCircle2 } from 'lucide-react'
import { DateRangeSelector } from '@/components/ui/date-range-selector'
import { DailyBarChart } from '@/components/workspace/common/bar-chart'
import AnalyticsCard from './analytics-card'
import { getWorkspaceTasksAnalyticsQueryFn } from '@/lib/api/analytics'
import useWorkspaceId from '@/hooks/use-workspace-id'

// ایمپورت سرویس و تایپ جدید

export default function TasksAnalytics() {
  const workspaceId = useWorkspaceId() // دریافت workspaceId جاری

  const [taskRange, setTaskRange] = useState({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  })

  // کوئری برای وظایف ایجاد شده
  const { data: createdData, isLoading: loadingCreated } = useQuery({
    queryKey: ['workspace-tasks-analytics', 'created', workspaceId, taskRange],
    queryFn: () =>
      getWorkspaceTasksAnalyticsQueryFn({
        workspaceId,
        start_date: format(taskRange.startDate, 'yyyy-MM-dd'),
        end_date: format(taskRange.endDate, 'yyyy-MM-dd'),
        type: 'created',
      }),
    enabled: !!workspaceId,
  })

  // کوئری برای وظایف تکمیل شده
  const { data: completedData, isLoading: loadingCompleted } = useQuery({
    queryKey: ['tasks', 'completed', workspaceId, taskRange],
    queryFn: () =>
      getWorkspaceTasksAnalyticsQueryFn({
        workspaceId,
        start_date: format(taskRange.startDate, 'yyyy-MM-dd'),
        end_date: format(taskRange.endDate, 'yyyy-MM-dd'),
        type: 'completed',
      }),
    enabled: !!workspaceId,
  })

  // استخراج آرایه taskAnalytics از پاسخ
  const createdTasks = createdData?.data?.taskAnalytics ?? []
  const completedTasks = completedData?.data?.taskAnalytics ?? []

  // محاسبه مجموع تعداد
  const totalCreated = createdTasks.reduce((sum, item) => sum + item.count, 0)
  const totalCompleted = completedTasks.reduce(
    (sum, item) => sum + item.count,
    0
  )

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between'>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          <CalendarDays size={20} /> آمار وظایف
        </h2>
        <DateRangeSelector value={taskRange} onChange={setTaskRange} />
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <AnalyticsCard
          isLoading={loadingCreated}
          title='ایجاد شده'
          value={totalCreated}
          icon={<CalendarPlus size={14} />}
          color='primary'
        />
        <AnalyticsCard
          isLoading={loadingCompleted}
          title='تکمیل شده'
          value={totalCompleted}
          icon={<CheckCircle2 size={14} />}
          color='primary'
        />
      </div>

      <div className='grid gap-6 sm:grid-cols-2'>
        <div className='rounded-lg border bg-card p-3'>
          <h3 className='mb-2 text-xs font-medium flex items-center gap-1 text-muted-foreground'>
            <CalendarDays size={12} /> ایجاد شده روزانه
          </h3>
          <DailyBarChart data={createdTasks} color='#3b82f6' />
        </div>
        <div className='rounded-lg border bg-card p-3'>
          <h3 className='mb-2 text-xs font-medium flex items-center gap-1 text-muted-foreground'>
            <CheckCircle2 size={12} /> تکمیل شده روزانه
          </h3>
          <DailyBarChart data={completedTasks} color='#10b981' />
        </div>
      </div>
    </section>
  )
}
