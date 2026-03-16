import CreateTaskDialog from '@/components/workspace/task/create-task-dialog'
import TaskTable from '@/components/workspace/task/task-table'

export default function Tasks() {
  return (
    <div className='w-full h-full flex-col space-y-8 pt-3' dir='rtl'>
      <div className='flex items-center justify-between space-y-2'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>همه تسک‌ها</h2>
          <p className='text-muted-foreground'>لیست تسک‌های این فضای کاری</p>
        </div>
        <CreateTaskDialog />
      </div>
      {/* {Task Table} */}
      <div>
        <TaskTable />
      </div>
    </div>
  )
}
