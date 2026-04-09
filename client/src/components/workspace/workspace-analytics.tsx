'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AnalyticsCard from './common/analytics-card'
import { MoveLeftIcon } from 'lucide-react'
import { getWorkspaceAnalyticsQueryFn } from '@/lib/api/dashboard'
import useWorkspaceId from '@/hooks/use-workspace-id'

const WorkspaceAnalytics = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'personal'>('personal')

  const workspaceId = useWorkspaceId()

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['workspaceAnalytics', workspaceId, activeTab],
    queryFn: () =>
      getWorkspaceAnalyticsQueryFn({
        workspaceId,
        type: activeTab,
        treandRange: 5,
      }),
    enabled: !!workspaceId,
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false
      return failureCount < 3
    },
  })

  const isPending = isLoading || isFetching

  const team = data?.analytics?.team
  const personal = data?.analytics?.personal

  return (
    <div className='space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'team' | 'personal')}
      >
        <TabsList>
          <TabsTrigger value='team'>آمار کل تیم</TabsTrigger>
          <TabsTrigger value='personal'>آمار من</TabsTrigger>
        </TabsList>

        <div className='flex justify-start items-center gap-1'>
          <MoveLeftIcon size={15} />
          <p className='text-sm opacity-65 my-3'>
            این آمار مربوط به این فضای کار میباشد
          </p>
        </div>

        {isError && (
          <p className='text-xs text-red-500'>
            خطا در دریافت آمار فضای کار
            {(error as any)?.message && `: ${(error as any).message}`}
          </p>
        )}

        {/* آمار تیم */}
        <TabsContent value='team' className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              isLoading={isPending}
              title='وظایف امروز تیم'
              value={team?.todayTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='total'
              trend={team?.todayTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={team?.todayTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف عقب‌افتاده امروز تیم'
              value={team?.overdueTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='overdue'
              trend={team?.overdueTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={team?.overdueTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف انجام‌شده امروز تیم'
              value={team?.completedTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='completed'
              trend={team?.completedTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={team?.completedTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف در حال انجام امروز تیم'
              value={team?.inProgressTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='inprogress'
              trend={team?.inProgressTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={team?.inProgressTasks?.chartData ?? []}
            />
          </div>
        </TabsContent>

        {/* آمار شخصی */}
        <TabsContent value='personal' className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              isLoading={isPending}
              title='وظایف امروز شما'
              value={personal?.todayTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='total'
              trend={personal?.todayTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={personal?.todayTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف عقب‌افتاده امروز شما'
              value={personal?.overdueTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='overdue'
              trend={personal?.overdueTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={personal?.overdueTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف انجام‌شده امروز شما'
              value={personal?.completedTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='completed'
              trend={personal?.completedTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={personal?.completedTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف در حال انجام امروز شما'
              value={personal?.inProgressTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='inprogress'
              trend={personal?.inProgressTasks?.trend ?? 0}
              trendLabel='نسبت به هفته قبل'
              chartData={personal?.inProgressTasks?.chartData ?? []}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WorkspaceAnalytics
