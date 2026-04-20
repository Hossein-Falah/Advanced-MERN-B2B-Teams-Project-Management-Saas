'use client'

import { Card } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'
import { useTranslation } from 'react-i18next'

export type AnalyticsKind = 'total' | 'overdue' | 'completed' | 'inprogress'

// ====== نگاشت رنگ‌ها ======
export type AnalyticsColor = 'primary' | 'green' | 'orange' | 'red' | 'purple'

const COLOR_CLASSES: Record<AnalyticsColor, string> = {
  primary: 'from-blue-500/10 via-blue-500/5 to-sky-500/10 border-blue-400/30',
  green:
    'from-emerald-500/10 via-emerald-500/5 to-green-500/10 border-emerald-400/30',
  orange:
    'from-orange-500/10 via-orange-500/5 to-amber-500/10 border-orange-400/30',
  red: 'from-red-500/10 via-red-500/5 to-rose-500/10 border-red-400/30',
  purple:
    'from-purple-500/10 via-purple-500/5 to-violet-500/10 border-purple-400/30',
}

const ICON_COLORS: Record<AnalyticsColor, string> = {
  primary: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#8b5cf6',
}

const ICON_TEXT: Record<AnalyticsColor, string> = {
  primary: 'text-blue-500',
  green: 'text-emerald-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  purple: 'text-purple-500',
}

// نگاشت kind به رنگ استاندارد
const kindToColor: Record<AnalyticsKind, AnalyticsColor> = {
  total: 'primary',
  overdue: 'red',
  completed: 'green',
  inprogress: 'orange',
}

export interface DetailedAnalyticsCardProps {
  title: string
  value: number
  totalValue?: number
  isLoading: boolean
  kind: AnalyticsKind
  trend?: number
  trendLabel?: string
  chartData?: number[]
}

const DetailedAnalyticsCard = ({
  title,
  value,
  totalValue,
  isLoading,
  kind,
  trend,
  trendLabel,
  chartData,
}: DetailedAnalyticsCardProps) => {
  const { t } = useTranslation()
  const color = kindToColor[kind]
  const isPositive = kind !== 'overdue'
  const safeTrendLabel = trendLabel || t('analytics.previousPeriod')

  if (isLoading) {
    return (
      <Card className='relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm shadow-sm'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-start justify-between'>
            <div className='h-4 w-24 rounded bg-muted animate-pulse' />
            <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
          </div>
          <div className='h-8 w-20 rounded bg-muted animate-pulse' />
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5',
        'backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300',
        'group cursor-default',
        COLOR_CLASSES[color]
      )}
    >
      {/* پس‌زمینه‌ی تزئینی */}
      <div
        className={cn(
          'pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full blur-3xl opacity-40',
          ICON_TEXT[color]
        )}
      />

      {/* آیکون بزرگ پس‌زمینه */}
      <div
        className={cn(
          'pointer-events-none absolute -bottom-6 -right-6 opacity-[0.08]',
          ICON_TEXT[color]
        )}
      >
        <Activity size={110} />
      </div>

      <div className='relative flex flex-col gap-3'>
        {/* هدر: عنوان و ترند */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-medium text-muted-foreground tracking-wide'>
              {title}
            </p>

            {trend !== undefined && (
              <div className='flex items-center gap-1 text-[11px] text-muted-foreground/80'>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold',
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-red-500/10 text-red-600'
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight size={11} />
                  ) : (
                    <ArrowDownRight size={11} />
                  )}
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
                <span>{safeTrendLabel}</span>
              </div>
            )}
          </div>

          {/* آیکون کوچک */}
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl border',
              'bg-background/60 backdrop-blur-sm shadow-xs',
              ICON_TEXT[color]
            )}
          >
            <Activity size={14} />
          </div>
        </div>

        {/* مقدار و اسپارک‌لاین */}
        <div className='flex items-end justify-between gap-2'>
          <div className='flex flex-col'>
            <span className='text-[11px] text-muted-foreground/80'>
              {t('analytics.value')}
            </span>
            <div className='text-3xl font-extrabold tracking-tight'>
              {value.toLocaleString('fa-IR')}
            </div>

            {totalValue !== undefined && (
              <div className='mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/80'>
                <span>
                  {t('analytics.totalCount')} :{' '}
                  <span className='font-semibold'>
                    {totalValue.toLocaleString('fa-IR')}
                  </span>
                </span>
              </div>
            )}
          </div>

          {chartData && chartData.length > 1 && (
            <div className='ml-1 w-24'>
              <Sparkline
                data={chartData}
                color={ICON_COLORS[color]}
                strokeWidth={2.4}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default DetailedAnalyticsCard
