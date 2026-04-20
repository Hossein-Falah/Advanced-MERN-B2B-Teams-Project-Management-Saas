// src/components/profile/activity-timeline.tsx
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ProfileActivityItem } from '@/types/profile.type'

const Summary = ({ hourTasks }: { hourTasks: ProfileActivityItem[] }) => {
  const { t } = useTranslation()

  // Calculate distinct task IDs
  const distinctTaskIds = React.useMemo(() => {
    try {
      const ids = new Set<string>()
      hourTasks?.forEach((hour) => {
        hour?.tasks?.forEach((task) => {
          if (task?._id) ids.add(task._id)
        })
      })
      return ids
    } catch {
      return new Set<string>()
    }
  }, [hourTasks])

  const totalDistinctTasks = distinctTaskIds.size

  const maxCount = React.useMemo(() => {
    try {
      return hourTasks?.length
        ? Math.max(...hourTasks.map((d) => d?.count || 0))
        : 0
    } catch {
      return 0
    }
  }, [hourTasks])

  const avgPerActiveHour = React.useMemo(() => {
    try {
      const activeHours = hourTasks?.filter((d) => (d?.count || 0) > 0) || []
      if (activeHours.length === 0) return 0

      const totalCount = activeHours.reduce(
        (sum, d) => sum + (d?.count || 0),
        0
      )

      return Math.round(totalCount / activeHours.length)
    } catch {
      return 0
    }
  }, [hourTasks])

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge
        variant='outline'
        className='border-emerald-200/70 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs h-5 px-2'
      >
        {t('profileView.summary.totalTasks')}: {totalDistinctTasks}
      </Badge>

      <Badge
        variant='outline'
        className='border-gray-200 dark:border-gray-700 text-xs h-5 px-2'
      >
        {t('profileView.summary.maxPerHour')}: {maxCount}
      </Badge>

      <Badge
        variant='outline'
        className='border-gray-200 dark:border-gray-700 text-xs h-5 px-2'
      >
        {t('profileView.summary.avgPerHour')}: {avgPerActiveHour}
      </Badge>
    </div>
  )
}

export default Summary
