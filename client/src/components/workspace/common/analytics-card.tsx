// src/components/workspace/common/analytics-card.tsx

'use client'

import { Card } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, Loader2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'

export type AnalyticsKind = 'total' | 'overdue' | 'completed' | 'inprogress'

const COLORS = {
  total: 'from-blue-500/10 via-blue-500/5 to-sky-500/10 border-blue-400/30',
  overdue: 'from-red-500/10 via-red-500/5 to-rose-500/10 border-red-400/30',
  completed:
    'from-emerald-500/10 via-emerald-500/5 to-green-500/10 border-emerald-400/30',
  inprogress:
    'from-amber-500/10 via-amber-500/5 to-yellow-500/10 border-amber-400/30',
}

const ICON_COLORS = {
  total: '#3b82f6',
  overdue: '#ef4444',
  completed: '#10b981',
  inprogress: '#f59e0b',
}

const ICON_TEXT = {
  total: 'text-blue-500',
  overdue: 'text-red-500',
  completed: 'text-emerald-500',
  inprogress: 'text-amber-500',
}

export interface AnalyticsCardProps {
  title: string
  value: number
  isLoading: boolean
  kind: AnalyticsKind
  trend?: number
  trendLabel?: string
  chartData?: number[]
}

const AnalyticsCard = ({
  title,
  value,
  isLoading,
  kind,
  trend,
  trendLabel = 'نسبت به دوره قبل',
  chartData,
}: AnalyticsCardProps) => {
  const isPositive = kind !== 'overdue'

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4',
        'backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300',
        'group cursor-default',
        COLORS[kind],
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full blur-3xl opacity-40',
          ICON_TEXT[kind],
        )}
      />

      <div
        className={cn(
          'pointer-events-none absolute -bottom-6 -right-6 opacity-[0.09]',
          ICON_TEXT[kind],
        )}
      >
        <Activity size={110} />
      </div>

      <div className='relative flex flex-col gap-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <p className='text-[11px] font-medium text-muted-foreground'>
              {title}
            </p>

            {trend !== undefined && (
              <div className='flex items-center gap-1 text-[11px] text-muted-foreground/80'>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold',
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-red-500/10 text-red-600',
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight size={11} />
                  ) : (
                    <ArrowDownRight size={11} />
                  )}
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>

                <span>{trendLabel}</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl border text-[13px]',
              'bg-background/60 backdrop-blur-sm shadow-xs',
              ICON_TEXT[kind],
            )}
          >
            <Activity size={14} />
          </div>
        </div>

        <div className='flex items-end justify-between gap-2'>
          <div className='flex flex-col'>
            <span className='text-[11px] text-muted-foreground/80'>مجموع</span>

            <div className='text-3xl font-extrabold tracking-tight'>
              {isLoading ? (
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              ) : (
                value.toLocaleString('fa-IR')
              )}
            </div>
          </div>

          {chartData && chartData.length > 1 && (
            <div className='ml-1 w-24'>
              <Sparkline
                data={chartData}
                color={ICON_COLORS[kind]}
                strokeWidth={2.4}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AnalyticsCard
