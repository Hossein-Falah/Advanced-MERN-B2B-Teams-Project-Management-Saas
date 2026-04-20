// ShortAnalytics.tsx - نسخه کامل اصلاح شده
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AnalyticsCard from './short-analytics-card'
import { MoveLeftIcon } from 'lucide-react'
import { getWorkspaceAnalyticsQueryFn } from '@/lib/api/analytics'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { useTranslation } from 'react-i18next'

type ShortAnalyticsProps = {
  projectId?: string
}

const ShortAnalytics = ({ projectId }: ShortAnalyticsProps) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'team' | 'personal'>('personal')
  const workspaceId = useWorkspaceId()

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['workspaceAnalytics', workspaceId, activeTab, projectId],
    queryFn: () =>
      getWorkspaceAnalyticsQueryFn({
        workspaceId,
        type: activeTab,
        treandRange: 5,
        projectId: projectId || undefined,
      }),
    enabled: !!workspaceId,
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false
      return failureCount < 3
    },
  })

  const isPending = isLoading || isFetching
  const team = data?.data?.analytics?.team
  const personal = data?.data?.analytics?.personal

  return (
    <div className='space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'team' | 'personal')}
      >
        <TabsList>
          <TabsTrigger value='team'>{t('analytics.teamTab')}</TabsTrigger>
          <TabsTrigger value='personal'>
            {t('analytics.personalTab')}
          </TabsTrigger>
        </TabsList>

        <div className='flex justify-start items-center gap-1'>
          <MoveLeftIcon size={15} />
          <p className='text-sm opacity-65 my-3'>
            {t('analytics.workspaceScopeHint')}
          </p>
        </div>

        {isError && (
          <p className='text-xs text-red-500'>
            {t('analytics.error.loadFailed')}
          </p>
        )}

        {/* آمار تیم */}
        <TabsContent value='team' className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.teamTodayTasks')}
              value={team?.todayTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='total'
              trend={team?.todayTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={team?.todayTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.teamOverdueTasks')}
              value={team?.overdueTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='overdue'
              trend={team?.overdueTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={team?.overdueTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.teamCompletedTasks')}
              value={team?.completedTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='completed'
              trend={team?.completedTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={team?.completedTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.teamInProgressTasks')}
              value={team?.inProgressTasks?.value ?? 0}
              totalValue={team?.todayTasks?.total ?? 0}
              kind='inprogress'
              trend={team?.inProgressTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={team?.inProgressTasks?.chartData ?? []}
            />
          </div>
        </TabsContent>

        {/* آمار شخصی */}
        <TabsContent value='personal' className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.personalTodayTasks')}
              value={personal?.todayTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='total'
              trend={personal?.todayTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={personal?.todayTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.personalOverdueTasks')}
              value={personal?.overdueTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='overdue'
              trend={personal?.overdueTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={personal?.overdueTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.personalCompletedTasks')}
              value={personal?.completedTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='completed'
              trend={personal?.completedTasks?.trend ?? 0}
              trendLabel={t('analytics.previousWeek')}
              chartData={personal?.completedTasks?.chartData ?? []}
            />

            <AnalyticsCard
              isLoading={isPending}
              title={t('analytics.personalInProgressTasks')}
              value={personal?.inProgressTasks?.value ?? 0}
              totalValue={personal?.todayTasks?.total ?? 0}
              kind='inprogress'
              trendLabel={t('analytics.previousWeek')}
              chartData={personal?.inProgressTasks?.chartData ?? []}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ShortAnalytics
