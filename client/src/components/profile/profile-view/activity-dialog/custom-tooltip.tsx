export const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
        <p className='font-medium text-gray-700'>{`ساعت ${data.hour - 1}:00 - ${data.hour}:00`}</p>
        <p className='text-green-600 mt-1'>{`تعداد فعالیت: ${data.count}`}</p>
        <div className='mt-2 max-h-40 overflow-y-auto'>
          {data.tasks.map((task: any, i: number) => (
            <div
              key={i}
              className='py-1 border-b border-gray-100 last:border-0'
            >
              <p className='text-sm text-gray-600'>{task.title}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}
