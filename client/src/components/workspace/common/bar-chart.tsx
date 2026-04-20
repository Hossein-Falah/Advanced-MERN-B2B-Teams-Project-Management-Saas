'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

interface DailyBarChartProps {
  data: { date: string; count: number }[]
  isMobile?: boolean
  color?: string
}

export const DailyBarChart = ({
  data,
  isMobile = false,
  color = '#10b981',
}: DailyBarChartProps) => {
  return (
    <ResponsiveContainer width='100%' height={250}>
      <BarChart
        data={data}
        margin={{ top: 10, right: isMobile ? 0 : 10, left: 0, bottom: 10 }}
        barCategoryGap='20%'
        barSize={isMobile ? 12 : 20}
      >
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='#e5e7eb'
          opacity={0.6}
        />
        <XAxis
          dataKey='date'
          tickFormatter={(v: string) => v.slice(5)} //
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: isMobile ? 9 : 10, fill: '#6b7280' }}
          interval={isMobile ? 3 : 1}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={30}
          allowDecimals={false}
          tick={{ fontSize: 9, fill: '#6b7280' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              return (
                <div className='rounded-lg border bg-background p-2 text-xs shadow-md'>
                  <p className='font-medium'>{payload[0].payload.date}</p>
                  <p className='text-muted-foreground'>
                    تعداد: {payload[0].value}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey='count'
          radius={[6, 6, 0, 0]}
          maxBarSize={isMobile ? 16 : 24}
          fill={`url(#gradient-${color.slice(1)})`}
          isAnimationActive
          animationDuration={900}
          animationEasing='ease-out'
        />
        <defs>
          <linearGradient
            id={`gradient-${color.slice(1)}`}
            x1='0'
            y1='0'
            x2='0'
            y2='1'
          >
            <stop offset='0%' stopColor={color} stopOpacity={0.9} />
            <stop offset='100%' stopColor={color} stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}
