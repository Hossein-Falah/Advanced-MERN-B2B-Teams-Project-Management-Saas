import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// i18n
import { useTranslation } from 'react-i18next'

type TimeFieldProps = {
  labelKey: string // کلید ترجمه لیبل
  value?: string // "HH:MM"
  onChange: (val: string) => void
  errorCode?: string | null // کد خطا از API (اختیاری)
}
export function TimeField({
  labelKey,
  value,
  onChange,
  errorCode,
}: TimeFieldProps) {
  const { t } = useTranslation()

  const [hourStr, minuteStr] = (value || '00:00').split(':')

  const hour = Number(hourStr) || 0
  const minute = Number(minuteStr) || 0

  const updateTime = (h: number, m: number) => {
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    onChange(`${hh}:${mm}`)
  }

  // مپ‌کردن کد خطا به پیام داخلی قابل ترجمه (جلوگیری از نمایش پیام خام API)
  const getErrorMessage = (code?: string | null) => {
    if (!code) return null

    const map: Record<string, string> = {
      REQUIRED: t('ui.timeField.errors.required'),
      INVALID_FORMAT: t('ui.timeField.errors.invalidFormat'),
      OUT_OF_RANGE: t('ui.timeField.errors.outOfRange'),
      // کدهای دیگر API را اینجا مپ کن
      DEFAULT: t('ui.timeField.errors.default'),
    }

    return map[code] || map.DEFAULT
  }

  const errorMessage = getErrorMessage(errorCode)

  return (
    <FormItem>
      <FormLabel>{t(labelKey)}</FormLabel>

      <div className='flex gap-2'>
        {/* ساعت */}
        <div className='flex flex-col gap-1'>
          <p className='text-xs'>{t('ui.timeField.hourLabel')}</p>

          <Select
            value={String(hour)}
            onValueChange={(h) => {
              updateTime(Number(h), minute)
            }}
          >
            <SelectTrigger className='w-[90px]'>
              <SelectValue placeholder={t('ui.timeField.hourPlaceholder')} />
            </SelectTrigger>

            <SelectContent className='max-h-[200px]'>
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {String(h).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* دقیقه */}
        <div className='flex flex-col gap-1'>
          <p className='text-xs'>{t('ui.timeField.minuteLabel')}</p>

          <Select
            value={String(minute)}
            onValueChange={(m) => {
              updateTime(hour, Number(m))
            }}
          >
            <SelectTrigger className='w-[90px]'>
              <SelectValue placeholder={t('ui.timeField.minutePlaceholder')} />
            </SelectTrigger>

            <SelectContent className='max-h-[200px]'>
              {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {String(m).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* اگر از FormMessage استفاده می‌کنی و خود فرم خطا دارد */}
      <FormMessage />

      {/* نمایش پیام خطا از روی کد، بدون لو دادن متن خام API */}
      {errorMessage && (
        <p className='text-xs text-red-500 mt-1'>{errorMessage}</p>
      )}
    </FormItem>
  )
}
