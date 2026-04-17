import { useTranslation } from 'react-i18next'
import CreateTaskDialog from '@/components/workspace/task/create-task-dialog'
import TaskTable from '@/components/workspace/task/task-table'

export default function Tasks() {
  const { t } = useTranslation()

  return (
    <div className='w-full h-full flex-col space-y-8 pt-3' dir='rtl'>
      <div className='flex items-center justify-between space-y-2'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('tasks.mainPage.title')}
          </h2>
          <p className='text-muted-foreground'>
            {t('tasks.mainPage.description')}
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      <div>
        <TaskTable />
      </div>
    </div>
  )
}
