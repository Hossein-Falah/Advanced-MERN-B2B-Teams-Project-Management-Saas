// src/components/profile/activity-timeline.tsx
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { ProfileActivityItem } from '@/types/profile.type'

const Summary = ({ hourTasks }: { hourTasks: ProfileActivityItem[] }) => {
  // Calculate distinct task IDs
  const distinctTaskIds = React.useMemo(() => {
    const ids = new Set<string>()
    hourTasks.forEach((hour) => {
      console.log(hour)
      hour.tasks.forEach((task) => ids.add(task._id))
    })
    return ids
  }, [hourTasks])

  const totalDistinctTasks = distinctTaskIds.size // Total unique tasks

  const maxCount = React.useMemo(
    () =>
      hourTasks.length ? Math.max(...hourTasks.map((d) => d.count || 0)) : 0,
    [hourTasks],
  )

  const avgPerActiveHour = React.useMemo(() => {
    const activeHours = hourTasks.filter((d) => d.count > 0)
    if (activeHours.length === 0) return 0
    const totalCount = activeHours.reduce((sum, d) => sum + d.count, 0)
    return Math.round(totalCount / activeHours.length)
  }, [hourTasks])

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge
        variant='outline'
        className='border-emerald-200/70 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs h-5 px-2'
      >
        کل وظایف: {totalDistinctTasks} {/* Fixed: Distinct tasks */}
      </Badge>
      <Badge
        variant='outline'
        className='border-gray-200 dark:border-gray-700 text-xs h-5 px-2'
      >
        بیشترین در ساعت: {maxCount}
      </Badge>
      <Badge
        variant='outline'
        className='border-gray-200 dark:border-gray-700 text-xs h-5 px-2'
      >
        میانگین در ساعت: {avgPerActiveHour}
      </Badge>
    </div>
  )
}

export default Summary
