import { ReactNode, useState, useEffect, useRef } from 'react'

interface AnalyticsCardProps {
  isLoading?: boolean
  title: string
  value: number
  isPrecent?: boolean
  icon?: ReactNode
  color?: 'primary' | 'green' | 'orange' | 'red' | 'purple'
  duration?: number // مدت زمان انیمیشن به میلی‌ثانیه
}

// هوک سفارشی برای شمارش از 0 تا مقدار نهایی
const useCountUp = (endValue: number, duration: number = 800) => {
  const [count, setCount] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number>()

  useEffect(() => {
    // اگر مقدار نهایی صفر باشد، سریع صفر شود
    if (endValue === 0) {
      setCount(0)
      return
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(1, elapsed / duration)
      const currentCount = Math.floor(progress * endValue)
      setCount(currentCount)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      startTimeRef.current = null
    }
  }, [endValue, duration])

  return count
}

const SkeletonCard = () => (
  <div className='rounded-xl bg-card p-5 shadow-sm animate-pulse border border-border/50'>
    <div className='flex items-start justify-between'>
      <div className='mb-3 h-4 w-24 rounded bg-muted' />
      <div className='h-8 w-8 rounded-full bg-muted' />
    </div>
    <div className='mb-2 h-8 w-20 rounded bg-muted' />
  </div>
)

const AnalyticsCard = ({
  isLoading,
  title,
  value,
  isPrecent,
  icon,
  color = 'primary',
  duration = 800,
}: AnalyticsCardProps) => {
  const count = useCountUp(value, duration)

  if (isLoading) return <SkeletonCard />

  const colorMap = {
    primary: 'from-blue-300 to-indigo-500',
    green: 'from-emerald-300 to-teal-500',
    orange: 'from-orange-300 to-amber-500',
    red: 'from-red-300 to-rose-500',
    purple: 'from-purple-300 to-violet-500',
  }
  const gradientClass = colorMap[color]

  return (
    <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/80 p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50'>
      {/* نوار رنگی بالای کارت */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradientClass}`}
      />

      <div className='flex items-start justify-between'>
        <h3 className='text-sm font-medium text-muted-foreground tracking-wide gap-2 flex justify-center items-center'>
          <span> {title}</span>
          <span className='text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            {count.toLocaleString()}
            {isPrecent && '%'}
          </span>
        </h3>
        {icon && (
          <div
            className={`rounded-full p-2 bg-gradient-to-br ${gradientClass} text-white shadow-md`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* خط تزیینی پایین */}
      <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary/40 transition-all duration-300' />
    </div>
  )
}

export default AnalyticsCard
