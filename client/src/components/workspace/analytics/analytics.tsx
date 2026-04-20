import WorkspaceAnalytics from '../common/short-analytics'
import ProjectsAnalytics from './projects-analytics'
import TasksAnalytics from './tasks-analytics'
import UsersAnalytics from './users-analytics'

export default function AnalyticsPage() {
  return (
    <div className='space-y-10'>
      <WorkspaceAnalytics />
      <TasksAnalytics />
      <ProjectsAnalytics />
      <UsersAnalytics />
    </div>
  )
}
