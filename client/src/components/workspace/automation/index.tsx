import AutomationTable from './table/automation-table'

const AutomationPage = () => {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>مدیریت اتومیشن‌ها</h1>
      <AutomationTable />
    </div>
  )
}

export default AutomationPage
