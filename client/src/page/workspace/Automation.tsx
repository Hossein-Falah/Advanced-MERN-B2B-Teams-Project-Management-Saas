import CreateAutomationDialog from '@/components/workspace/automation/create-automation-dialog'
import AutomationTable from '@/components/workspace/automation/table/automation-table'

const Automation = () => {
  return (
    <div className='w-full h-full flex-col space-y-8 pt-3' dir='rtl'>
      <div className='flex items-center justify-between space-y-2'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold tracking-tight'>همه اتومیشن ‌ها</h2>
          <p className='text-muted-foreground'>
            لیست اتومیشن ‌های این فضای کاری
          </p>
        </div>
        <CreateAutomationDialog />
      </div>
      {/* { AutomationTable} */}
      <div>
        <AutomationTable />
      </div>
    </div>
  )
}

export default Automation
