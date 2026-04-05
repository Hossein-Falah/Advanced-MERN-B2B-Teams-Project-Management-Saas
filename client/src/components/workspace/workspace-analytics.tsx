'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AnalyticsCard from './common/analytics-card'
import { MoveLeftIcon } from 'lucide-react'

const fakeData = {
  analytics: {
    team: {
      todayTasks: {
        value: 24,
        trend: 12,
        chartData: [2, 5, 4, 7, 6, 9, 8],
      },
      overdueTasks: {
        value: 6,
        trend: -5,
        chartData: [10, 9, 8, 7, 6, 5, 4],
      },
      completedTasks: {
        value: 80,
        trend: 18,
        chartData: [3, 4, 6, 8, 7, 9, 11],
      },
      inProgressTasks: {
        value: 14,
        trend: 3,
        chartData: [1, 3, 2, 4, 3, 5, 4],
      },
    },
    personal: {
      todayTasks: {
        value: 5,
        trend: 7,
        chartData: [1, 2, 2, 3, 4, 4, 5],
      },
      overdueTasks: {
        value: 1,
        trend: -2,
        chartData: [5, 5, 4, 4, 3, 3, 2],
      },
      completedTasks: {
        value: 18,
        trend: 15,
        chartData: [2, 3, 4, 6, 7, 8, 9],
      },
      inProgressTasks: {
        value: 3,
        trend: 4,
        chartData: [1, 2, 3, 3, 4, 4, 5],
      },
    },
  },
}

const WorkspaceAnalytics = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'personal'>('personal')

  // فعلاً فیک دیتا؛ بعداً اینجا به‌جای fakeData می‌تونی
  // useQuery با type=activeTab رو صدا بزنی
  const data = fakeData
  const isPending = false

  const team = data.analytics.team
  const personal = data.analytics.personal

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
        {/* تب آمار تیم */}
        <TabsContent value='team' className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              isLoading={isPending}
              title='وظایف امروز تیم'
              value={team.todayTasks.value}
              kind='total'
              trend={team.todayTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={team.todayTasks.chartData}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف عقب‌افتاده تیم'
              value={team.overdueTasks.value}
              kind='overdue'
              trend={team.overdueTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={team.overdueTasks.chartData}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف انجام‌شده تیم'
              value={team.completedTasks.value}
              kind='completed'
              trend={team.completedTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={team.completedTasks.chartData}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف در حال انجام تیم'
              value={team.inProgressTasks.value}
              kind='inprogress'
              trend={team.inProgressTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={team.inProgressTasks.chartData}
            />
          </div>
        </TabsContent>

        {/* تب آمار شخصی */}
        <TabsContent value='personal' className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              isLoading={isPending}
              title='وظایف امروز شما'
              value={personal.todayTasks.value}
              kind='total'
              trend={personal.todayTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={personal.todayTasks.chartData}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف عقب‌افتاده شما'
              value={personal.overdueTasks.value}
              kind='overdue'
              trend={personal.overdueTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={personal.overdueTasks.chartData}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف انجام‌شده شما'
              value={personal.completedTasks.value}
              kind='completed'
              trend={personal.completedTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={personal.completedTasks.chartData}
            />

            <AnalyticsCard
              isLoading={isPending}
              title='وظایف در حال انجام شما'
              value={personal.inProgressTasks.value}
              kind='inprogress'
              trend={personal.inProgressTasks.trend}
              trendLabel='نسبت به هفته قبل'
              chartData={personal.inProgressTasks.chartData}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WorkspaceAnalytics
