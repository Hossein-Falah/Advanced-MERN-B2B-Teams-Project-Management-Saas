// src/components/profile/activity-timeline.tsx
import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Clock,
  AlertCircle,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AreaChart as AreaIcon,
} from 'lucide-react'
import { ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { getProfileActivityAnalyticsQueryFn } from '@/lib/api/profile'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { JalaliDateSelector } from '@/components/ui/date-selector'
import ActiviryBarChart from './activity-bar-chart'
import ActivityPieChart from './activity-pie-chart'
import { ProfileActivityItem } from '@/types/profile.type'
import Summary from './summary'
import ActivityTimelineSkeleton from './activity-skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import ActivityLineChart from './activity-line-chart'
import ActiviryAreaChart from './activity-area-chart'
import { useTranslation } from 'react-i18next'

type ProfileActivityTimelineDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  username?: string
  date?: string
}

// نوع‌های نمودار که داریم
type ChartType = 'bar' | 'pie' | 'line' | 'area'

const ProfileActivityTimelineDialog: React.FC<
  ProfileActivityTimelineDialogProps
> = ({ open, username, onOpenChange, title, date }) => {
  const { t } = useTranslation()
  const workspaceId = useWorkspaceId()

  // عنوان دیالوگ: اگر از بیرون پاس نشده باشد، از i18n خوانده می‌شود
  const dialogTitle = title ?? t('profileView.activity.title')

  // نوع نمودار: ستونی، دایره‌ای، خطی، ناحیه‌ای
  const [chartType, setChartType] = React.useState<ChartType>('bar')

  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    if (date) return date
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['userProfileActivity', username, workspaceId, selectedDate],
    queryFn: () =>
      getProfileActivityAnalyticsQueryFn({
        workspaceId: workspaceId,
        date: selectedDate,
      }),
    enabled: !!username && !!workspaceId && !!selectedDate && open,
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false
      return failureCount < 3
    },
  })

  const hourTasks: ProfileActivityItem[] = React.useMemo(() => {
    if (!data?.data) return []
    return data.data?.analytics.map((item: any) => ({
      hour: item.hour,
      count: item.count ?? 0,
      tasks: (item.tasks ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        startDate: t.startDate,
        dueDate: t.dueDate,
      })),
    }))
  }, [data])

  // تشخیص موبایل برای ریسپانسیو بودن تب نمودارها
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isSkeleton = isLoading || isFetching

  // تب‌های نمودار با آیکن + عنوان
  const chartTabs: {
    id: ChartType
    label: string
    icon: React.ReactNode
  }[] = [
    {
      id: 'bar',
      label: t('profileView.activity.chartTabs.bar'),
      icon: <BarChart2 className='w-3 h-3 ml-1' />,
    },
    {
      id: 'pie',
      label: t('profileView.activity.chartTabs.pie'),
      icon: <PieChartIcon className='w-3 h-3 ml-1' />,
    },
    {
      id: 'line',
      label: t('profileView.activity.chartTabs.line'),
      icon: <LineChartIcon className='w-3 h-3 ml-1' />,
    },
    {
      id: 'area',
      label: t('profileView.activity.chartTabs.area'),
      icon: <AreaIcon className='w-3 h-3 ml-1' />,
    },
  ]

  // هندل امن خطا: هیچ پیام خامی از error / API نمایش داده نشود
  const isNotFound =
    (error as any)?.response?.status && (error as any)?.response?.status === 404

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl w-full p-2 sm:p-4 lg:p-6' dir='rtl'>
        {isSkeleton ? (
          <ActivityTimelineSkeleton title={dialogTitle} username={username} />
        ) : (
          <>
            <DialogHeader className='space-y-1 mt-2 md:mt-3'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <DialogTitle className='flex items-center justify-center gap-2 text-sm lg:text-base mb-2 '>
                  <Clock className='w-4 h-4 text-emerald-500' />
                  <span>{dialogTitle}</span>
                  {username && (
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      ({username})
                    </span>
                  )}
                </DialogTitle>

                <JalaliDateSelector
                  value={selectedDate}
                  onChange={setSelectedDate}
                  disabled={false}
                />
              </div>
            </DialogHeader>

            {isError && (
              <div className='mt-2 mb-1 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'>
                <AlertCircle className='w-4 h-4 mt-[2px]' />
                <div>
                  {/* پیام عمومی خطا */}
                  <div>{t('profileView.activity.error.generic')}</div>

                  {/* پیام خاص 404 یا سایر خطاها، ولی همچنان بدون نمایش متن API */}
                  <div className='mt-1 text-xs opacity-80'>
                    {isNotFound
                      ? t('profileView.activity.error.notFound')
                      : t('profileView.activity.error.unexpected')}
                  </div>
                </div>
              </div>
            )}

            <div className='mt-2 space-y-3 sm:space-y-4'>
              {/* Summary + سوییچ نوع نمودار + راهنمای شدت فعالیت */}
              <div className='flex flex-wrap items-center justify-between gap-2 text-xs lg:text-sm'>
                <TooltipProvider>
                  <div className='flex flex-wrap items-center gap-2'>
                    {/* تب‌های نمودار - ریسپانسیو */}
                    <div className='flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden'>
                      {chartTabs.map((tab) => {
                        const isActive = chartType === tab.id

                        return (
                          <button
                            key={tab.id}
                            onClick={() => setChartType(tab.id)}
                            className={`group flex items-center transition-all duration-300 px-3 py-2 ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            {tab.icon}

                            <span
                              className={`${
                                isActive
                                  ? 'max-w-[80px] opacity-100'
                                  : 'max-w-0 opacity-0'
                              } overflow-hidden whitespace-nowrap ml-0 group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-1 transition-all duration-300 text-xs`}
                            >
                              {tab.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </TooltipProvider>
              </div>

              {/* باکس نمودار */}
              <div className='rounded-md border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50/70 dark:from-gray-900 dark:to-gray-950/60 p-2 sm:p-3 flex flex-col justify-center items-center'>
                <div
                  className='w-full h-[250px] sm:h-[350px] outline-none focus:outline-none'
                  style={{ pointerEvents: 'auto' }}
                >
                  <ResponsiveContainer width='100%' height='100%'>
                    {chartType === 'bar' && (
                      <ActiviryBarChart
                        hourTasks={hourTasks}
                        isMobile={isMobile}
                      />
                    )}

                    {chartType === 'pie' && (
                      <ActivityPieChart
                        isMobile={isMobile}
                        hourTasks={hourTasks}
                      />
                    )}

                    {chartType === 'line' && (
                      <ActivityLineChart
                        isMobile={isMobile}
                        hourTasks={hourTasks}
                      />
                    )}

                    {chartType === 'area' && (
                      <ActiviryAreaChart
                        isMobile={isMobile}
                        hourTasks={hourTasks}
                      />
                    )}
                  </ResponsiveContainer>
                </div>
                <Summary hourTasks={hourTasks} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ProfileActivityTimelineDialog
