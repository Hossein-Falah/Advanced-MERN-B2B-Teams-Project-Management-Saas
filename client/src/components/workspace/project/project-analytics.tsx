import { useParams } from 'react-router-dom'
import AnalyticsCard from '../common/analytics-card'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { useQuery } from '@tanstack/react-query'
import { getProjectAnalyticsQueryFn } from '@/lib/api'

const ProjectAnalytics = () => {
  const param = useParams()
  const projectId = param.projectId as string

  const workspaceId = useWorkspaceId()

  const { data, isPending } = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: () => getProjectAnalyticsQueryFn({ workspaceId, projectId }),
    staleTime: 0,
    enabled: !!projectId,
  })

  const analytics = data?.analytics

  return (
    <div className='grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3'>
      <AnalyticsCard
        isLoading={isPending}
        title='کل وظایف'
        value={analytics?.totalTasks || 0}
        kind='total'
      />
      <AnalyticsCard
        isLoading={isPending}
        title='وظایف عقب‌ افتاده'
        value={analytics?.overdueTasks || 0}
        kind='overdue'
      />
      <AnalyticsCard
        isLoading={isPending}
        title='وظایف تکمیل‌شده'
        value={analytics?.completedTasks || 0}
        kind='completed'
      />
    </div>
  )
}

export default ProjectAnalytics
