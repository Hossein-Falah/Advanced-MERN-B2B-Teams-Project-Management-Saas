import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CustomTooltip } from './custom-tooltip'
import { ProfileActivityItem } from '@/types/profile.type'

const ActiviryAreaChart = ({
  hourTasks,
  isMobile,
}: {
  hourTasks: ProfileActivityItem[]
  isMobile: boolean
}) => {
  return (
    <AreaChart
      data={hourTasks}
      margin={{
        top: 10,
        right: isMobile ? 0 : 10,
        left: 0,
        bottom: 10,
      }}
    >
      <CartesianGrid
        strokeDasharray='3 3'
        vertical={false}
        stroke='#e5e7eb'
        opacity={0.6}
      />

      <XAxis
        dataKey='hour'
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        interval={isMobile ? 3 : 1}
        tick={{
          fontSize: isMobile ? 9 : 10,
          fill: '#6b7280',
        }}
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

      <Area
        type='monotone'
        dataKey='count'
        stroke='#10b981'
        strokeWidth={2}
        fill='url(#activityGradient)'
        dot={{ r: 2 }}
        activeDot={{ r: 5 }}
        animationDuration={900}
      />

      <defs>
        <linearGradient id='activityGradient' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#10b981' stopOpacity={0.4} />
          <stop offset='100%' stopColor='#6ee7b7' stopOpacity={0.05} />
        </linearGradient>
      </defs>
    </AreaChart>
  )
}

export default ActiviryAreaChart
