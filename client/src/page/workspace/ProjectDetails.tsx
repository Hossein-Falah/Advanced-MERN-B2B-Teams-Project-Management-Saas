import { Separator } from '@/components/ui/separator'
import ShortAnalytics from '@/components/workspace/common/short-analytics'
import ProjectHeader from '@/components/workspace/project/project-header'
import TaskTable from '@/components/workspace/task/task-table'

const ProjectDetails = () => {
  return (
    <div className='w-full space-y-6 py-4 md:pt-3'>
      <ProjectHeader />
      <div className='space-y-5'>
        <ShortAnalytics />
        <Separator />
        {/* {Task Table} */}
        <TaskTable />
      </div>
    </div>
  )
}

export default ProjectDetails
