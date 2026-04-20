import React from 'react'
import { useTranslation } from 'react-i18next'

type CustomTooltipProps = {
  active?: boolean
  payload?: any[]
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  const { t } = useTranslation()

  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
        {/* ساعت بازه زمانی */}
        <p className='font-medium text-gray-700'>
          {t('profileView.activity.tooltip.hourRange', {
            startHour: data.hour - 1,
            endHour: data.hour,
          })}
        </p>

        {/* تعداد فعالیت */}
        <p className='text-green-600 mt-1'>
          {t('profileView.activity.tooltip.count', {
            count: data.count,
          })}
        </p>

        {/* لیست تسک‌ها */}
        <div className='mt-2 max-h-40 overflow-y-auto'>
          {data.tasks?.map((task: any, i: number) => (
            <div
              key={i}
              className='py-1 border-b border-gray-100 last:border-0'
            >
              <p className='text-sm text-gray-600'>{task.title}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
