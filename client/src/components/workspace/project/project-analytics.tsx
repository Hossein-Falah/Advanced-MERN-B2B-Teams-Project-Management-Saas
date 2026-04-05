'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AnalyticsCard from '../common/analytics-card'
import { MoveLeftIcon } from 'lucide-react'

type AnalyticsKind = 'total' | 'overdue' | 'completed' | 'inprogress'
type TabKey = 'team' | 'personal'

type Metric = {
  value: number
  trend: number
  chartData: number[]
}

type TabAnalytics = {
  todayTasks: Metric
  overdueTasks: Metric
  completedTasks: Metric
  inProgressTasks: Metric
}

type AnalyticsData = {
  analytics: Record<TabKey, TabAnalytics>
}

const fakeData: AnalyticsData = {
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

const cardsConfig: {
  key: keyof TabAnalytics
  kind: AnalyticsKind
  title: { team: string; personal: string }
}[] = [
  {
    key: 'todayTasks',
    kind: 'total',
    title: {
      team: 'وظایف امروز تیم',
      personal: 'وظایف امروز شما',
    },
  },
  {
    key: 'overdueTasks',
    kind: 'overdue',
    title: {
      team: 'وظایف عقب‌افتاده تیم',
      personal: 'وظایف عقب‌افتاده شما',
    },
  },
  {
    key: 'completedTasks',
    kind: 'completed',
    title: {
      team: 'وظایف انجام‌شده تیم',
      personal: 'وظایف انجام‌شده شما',
    },
  },
  {
    key: 'inProgressTasks',
    kind: 'inprogress',
    title: {
      team: 'وظایف در حال انجام تیم',
      personal: 'وظایف در حال انجام شما',
    },
  },
]

const WorkspaceAnalytics = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('personal')

  // TODO
  // const param = useParams()
  // const projectId = param.projectId as string

  // const workspaceId = useWorkspaceId()

  // const { data, isPending } = useQuery({
  //   queryKey: ['project-analytics', projectId],
  //   queryFn: () => getProjectAnalyticsQueryFn({ workspaceId, projectId }),
  //   staleTime: 0,
  //   enabled: !!projectId,
  // })

  const data = fakeData
  const isPending = false

  const analytics = data.analytics

  const renderTabContent = (tab: TabKey) => {
    const tabData = analytics[tab]

    return (
      <TabsContent value={tab} className='space-y-3'>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {cardsConfig.map((card) => {
            const metric = tabData[card.key]

            return (
              <AnalyticsCard
                key={`${tab}-${card.key}`}
                isLoading={isPending}
                title={card.title[tab]}
                value={metric.value}
                kind={card.kind}
                trend={metric.trend}
                trendLabel='نسبت به هفته قبل'
                chartData={metric.chartData}
              />
            )
          })}
        </div>
      </TabsContent>
    )
  }

  return (
    <div className='space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
      >
        <TabsList>
          <TabsTrigger value='team'>آمار کل تیم</TabsTrigger>
          <TabsTrigger value='personal'>آمار من</TabsTrigger>
        </TabsList>
        <div className='flex justify-start items-center gap-1'>
          <MoveLeftIcon size={15} />
          <p className='text-sm opacity-65 my-3'>
            این آمار مربوط به این پروژه میباشد{' '}
          </p>
        </div>
        {renderTabContent('team')}
        {renderTabContent('personal')}
      </Tabs>
    </div>
  )
}

export default WorkspaceAnalytics
