import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CustomTooltip } from './custom-tooltip'
import { ProfileActivityItem } from '@/types/profile.type'

const ActiviryBarChart = ({
  hourTasks,
  isMobile,
}: {
  hourTasks: ProfileActivityItem[]
  isMobile: boolean
}) => {
  return (
    <BarChart
      data={hourTasks}
      margin={{
        top: 10,
        right: isMobile ? 0 : 10,
        left: 0,
        bottom: 10,
      }}
      barCategoryGap='20%'
      barSize={isMobile ? 12 : 20}
      tabIndex={-1}
      onClick={() => {}}
    >
      <CartesianGrid
        strokeDasharray='3 3'
        vertical={false}
        stroke='#e5e7eb'
        opacity={0.6}
      />
      <XAxis
        dataKey='hour'
        tickFormatter={(v: number) => v.toString()}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tick={{
          fontSize: isMobile ? 9 : 10,
          fill: '#6b7280',
        }}
        interval={isMobile ? 3 : 1}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        width={30}
        allowDecimals={false}
        tick={{
          fontSize: 9,
          fill: '#6b7280',
        }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar
        dataKey='count'
        radius={[6, 6, 0, 0]}
        maxBarSize={isMobile ? 16 : 24}
        fill='url(#activityGradient)'
        isAnimationActive={true}
        animationDuration={900}
        animationEasing='ease-out'
        animationBegin={0}
      />
      <defs>
        <linearGradient id='activityGradient' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#10b981' stopOpacity={0.9} />
          <stop offset='100%' stopColor='#6ee7b7' stopOpacity={0.6} />
        </linearGradient>
      </defs>
    </BarChart>
  )
}

export default ActiviryBarChart
