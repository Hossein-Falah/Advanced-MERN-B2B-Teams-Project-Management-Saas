import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  color?: string
  strokeWidth?: number
}

export const Sparkline = ({
  data,
  color = '#3b82f6',
  strokeWidth = 2,
}: SparklineProps) => {
  if (!data || data.length < 2) return null

  const chartData = data.map((value, index) => ({
    value,
    index,
  }))

  return (
    <div className='h-14 w-full opacity-80 transition-all group-hover:opacity-100'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={chartData}>
          <Line
            type='natural'
            dataKey='value'
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
