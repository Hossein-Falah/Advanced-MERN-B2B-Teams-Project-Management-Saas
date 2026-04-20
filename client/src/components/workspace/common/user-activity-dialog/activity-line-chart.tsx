import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CustomTooltip } from '../../../ui/custom-tooltip'
import { ProfileActivityItem } from '@/types/profile.type'

const ActivityLineChart = ({
  hourTasks,
  isMobile,
}: {
  hourTasks: ProfileActivityItem[]
  isMobile: boolean
}) => {
  return (
    <LineChart
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

      <Line
        type='monotone'
        dataKey='count'
        stroke='#10b981'
        strokeWidth={2}
        dot={{ r: isMobile ? 2 : 3 }}
        activeDot={{ r: isMobile ? 4 : 5 }}
        isAnimationActive={true}
        animationDuration={900}
        animationEasing='ease-out'
      />
    </LineChart>
  )
}

export default ActivityLineChart
