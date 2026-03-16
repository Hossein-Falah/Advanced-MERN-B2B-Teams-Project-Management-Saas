import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import useCreateProjectDialog from '@/hooks/use-create-project-dialog'
import WorkspaceAnalytics from '@/components/workspace/workspace-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RecentProjects from '@/components/workspace/project/recent-projects'
import RecentTasks from '@/components/workspace/task/recent-tasks'
import RecentMembers from '@/components/workspace/member/recent-members'
const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog()
  return (
    <main className='flex flex-1 flex-col py-4 md:pt-3'>
      <div className='flex items-center justify-between space-y-2 mb-6'>
        <div className='gap-4 flex flex-col'>
          <h2 className='text-2xl font-bold tracking-tight'>داشبورد من</h2>
          <p className='text-muted-foreground text-xs lg:text-[14px]'>
            در اینجا یک نمای کلی از این فضای کاری آمده است!
          </p>
        </div>
        <Button onClick={onOpen}>
          <Plus />
          پروژه جدید
        </Button>
      </div>
      <WorkspaceAnalytics />
      <div className='mt-4'>
        <Tabs defaultValue='projects' className='w-full border rounded-lg p-2'>
          <TabsList className='w-full justify-start border-0 bg-gray-50 px-1 h-12'>
            <TabsTrigger className='py-2' value='projects'>
              پروژه‌های اخیر
            </TabsTrigger>

            <TabsTrigger className='py-2' value='tasks'>
              وظایف اخیر
            </TabsTrigger>

            <TabsTrigger className='py-2' value='members'>
              اعضای اخیر
            </TabsTrigger>
          </TabsList>
          <TabsContent value='projects'>
            <RecentProjects />
          </TabsContent>
          <TabsContent value='tasks'>
            <RecentTasks />
          </TabsContent>
          <TabsContent value='members'>
            <RecentMembers />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default WorkspaceDashboard
