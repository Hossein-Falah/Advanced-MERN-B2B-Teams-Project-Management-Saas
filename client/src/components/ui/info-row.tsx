const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value?: string
}) => {
  if (!value) return null

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400'>
        <Icon className='h-3.5 w-3.5' />
        <span className='font-medium'>{label}</span>
      </div>
      <p className='text-[12px] text-gray-900 dark:text-gray-100 truncate'>
        {value}
      </p>
    </div>
  )
}
export default InfoRow
