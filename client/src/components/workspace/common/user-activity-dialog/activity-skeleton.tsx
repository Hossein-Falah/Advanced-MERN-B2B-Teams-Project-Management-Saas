// src/components/profile/activity-timeline-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Clock } from 'lucide-react'

type ActivitySkeletonProps = {
  title?: string
  username?: string
}

const ActivitySkeleton: React.FC<ActivitySkeletonProps> = ({
  title = 'آمار فعالیت ۲۴ ساعته',
  username,
}) => {
  return (
    <div className='space-y-3 sm:space-y-4 mt-1 sm:mt-3' dir='rtl'>
      {/* Header (title + date picker) */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2 text-sm lg:text-base'>
          <Clock className='w-4 h-4 text-emerald-500' />
          <span>{title}</span>
          {username && (
            <span className='text-xs text-gray-500 dark:text-gray-400'>
              ({username})
            </span>
          )}
        </div>

        {/* Date picker skeleton */}
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-32 rounded-md' />
        </div>
      </div>

      {/* Description skeleton */}
      <div className='text-xs lg:text-sm leading-relaxed space-y-1'>
        <Skeleton className='h-3 w-52 max-w-full' />
        <Skeleton className='h-3 w-40 max-w-full' />
      </div>

      {/* Summary + legend */}
      <div className='flex flex-wrap items-center justify-between gap-2 text-xs lg:text-sm'>
        {/* Summary skeleton */}
        <div className='flex flex-wrap items-center gap-2'>
          <Skeleton className='h-5 w-24 rounded-full' />
          <Skeleton className='h-5 w-32 rounded-full' />
          <Skeleton className='h-5 w-28 rounded-full' />
        </div>
      </div>

      {/* Chart skeleton */}
      <div className='rounded-md border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50/70 dark:from-gray-900 dark:to-gray-950/60 p-2 sm:p-3'>
        <div className='w-full h-[180px] sm:h-[220px] relative'>
          {/* Grid lines simulation */}
          <div className='absolute inset-0 flex flex-col justify-between'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='w-full h-px bg-gray-100 dark:bg-gray-800'
              />
            ))}
          </div>

          {/* Bars and labels */}
          <div className='absolute bottom-8 left-0 right-0 top-0 flex items-end justify-between'>
            {[...Array(24)].map((_, i) => {
              const height = `${Math.floor(Math.random() * 70) + 30}%`
              return (
                <div
                  key={i}
                  className='h-full mx-[0.1rem] md:mx-1 flex flex-col items-center justify-end'
                  style={{ width: 'calc(100% / 12 - 2px)' }}
                >
                  <Skeleton
                    style={{ height }}
                    className={`h-3  w-full mt-1 bg-gray-200 dark:bg-gray-800`}
                  />
                  <Skeleton className='h-3  w-full mt-1 bg-gray-200 dark:bg-gray-800' />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivitySkeleton
