import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ProfileActivityItem } from '@/types/profile.type'
import { CustomTooltip } from '../../../ui/custom-tooltip'

const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  index,
}: any) => {
  const radius = outerRadius + 18
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  const hour = index === 0 ? 24 : index

  return (
    <text
      x={x}
      y={y}
      fill='#374151'
      textAnchor='middle'
      dominantBaseline='central'
      fontSize={11}
      fontWeight={600}
    >
      {hour}
    </text>
  )
}

const ActivityPieChart = ({
  hourTasks,
  isMobile,
}: {
  hourTasks: ProfileActivityItem[]
  isMobile: boolean
}) => {
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const hour = i + 1
    const existing = hourTasks.find((item) => item.hour === hour)

    return {
      hour,
      count: existing?.count ?? 0,
      tasks: existing?.tasks ?? [],
      value: 1,
    }
  })

  const maxCount = Math.max(...fullData.map((d) => d.count))

  return (
    <PieChart width={350} height={350}>
      <Pie
        data={fullData}
        cx='50%'
        cy='50%'
        startAngle={90}
        endAngle={-270} // ساعتگرد
        dataKey='value'
        innerRadius={isMobile ? 60 : 80}
        outerRadius={isMobile ? 100 : 130}
        paddingAngle={1}
        labelLine={false}
        label={renderCustomizedLabel}
      >
        {fullData.map((entry, index) => {
          const intensity = maxCount > 0 ? entry.count / maxCount : 0

          const opacity = entry.count === 0 ? 0.05 : 0.3 + intensity * 0.7

          return <Cell key={index} fill='#10b981' opacity={opacity} />
        })}
      </Pie>

      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  )
}

export default ActivityPieChart
