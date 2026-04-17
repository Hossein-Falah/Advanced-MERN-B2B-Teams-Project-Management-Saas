// src/components/profile/ProfileView.tsx
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUserProfileMutationFn } from '@/lib/api/profile'
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Calendar,
  Clock,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import useWorkspaceId from '@/hooks/use-workspace-id'

import ProfileViewSkeleton from '../../skeleton-loaders/profile-view-skeleton'
import ProfileViewError from './profile-view-error'
import getAchievements from './profile-view-achivment'
import InfoRow from '../../ui/info-row'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import ProfileActivityTimelineDialog from '@/components/profile/profile-view/activity-dialog/activity-dialog'
import { ALL_DAYS } from '@/constant'
import { useTranslation } from 'react-i18next'

/** 🗓 تبدیل تاریخ میلادی به شمسی (بدون دیفالت متنی؛ در صورت خطا رشته خالی) */
const toJalali = (date?: string | number | Date | null) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

const ProfileView = () => {
  const { t } = useTranslation()
  const { username } = useParams<{ username: string }>()
  const workspaceId = useWorkspaceId()
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)

  // Map روزهای کاری از ALL_DAYS (بدون متن پیش‌فرض در اینجا)
  const workingDayLabelMap = useMemo(() => {
    const map = new Map<number, string>()
    ALL_DAYS.forEach((day) => {
      const translated = t(`days.${day.value}`)
      map.set(day.value, translated)
    })
    return map
  }, [t])

  // بدون متن notDefined؛ اگر روزها خالی باشند، رشته خالی برمی‌گردد
  const formatWorkingDays = (days?: number[]) => {
    if (!days || !days.length) return ''
    return days
      .map((d) => workingDayLabelMap.get(d) ?? '')
      .filter(Boolean)
      .join('، ')
  }

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userProfile', username, workspaceId],
    queryFn: () =>
      getUserProfileMutationFn({
        workspaceId: workspaceId,
        username: username!,
      }),
    enabled: !!username,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false
      return failureCount < 3
    },
  })

  if (isError && (error as any)?.response?.status === 404) {
    return <ProfileViewError />
  }

  if (isLoading || !userData) {
    return <ProfileViewSkeleton />
  }

  const user = userData.data?.user
  if (!user) {
    return <ProfileViewSkeleton />
  }
  const achievements = getAchievements(user)
  const workSchedule = user.workSchedule
  const region = user.region

  const hasWorkingDays =
    workSchedule &&
    formatWorkingDays(workSchedule.workingDays) &&
    workSchedule.startHour != null &&
    workSchedule.endHour != null

  return (
    <div
      className='w-full max-w-5xl mx-auto p-4 lg:p-6 text-[13px] lg:text-[14px]'
      dir='rtl'
    >
      {/* مودال آمار فعالیت */}
      <ProfileActivityTimelineDialog
        open={isTimelineOpen}
        onOpenChange={setIsTimelineOpen}
        title={t('profileView.activityDialog.title')}
        username={username}
      />

      <Card className='border border-gray-200/70 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-sm'>
        <CardHeader className='pb-3 border-b border-gray-100 dark:border-gray-800'>
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3'>
            {/* بخش عکس و نام */}
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <div className='w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm'>
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={t('profileView.imageAlt')}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900 dark:to-indigo-900 flex items-center justify-center'>
                      <UserIcon className='h-10 w-10 text-gray-400 dark:text-gray-500' />
                    </div>
                  )}
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-gray-900 ${
                    user.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                  aria-label={
                    user.isOnline
                      ? t('profileView.online')
                      : t('profileView.offline')
                  }
                />
              </div>

              <div className='space-y-1'>
                <div className='flex w-full gap-2 flex-col md:flex-row md:items-center'>
                  <h1 className='text-base lg:text-lg font-semibold text-gray-900 dark:text-white'>
                    {user.name}
                  </h1>
                  {user.jobTitle && (
                    <Badge
                      variant='outline'
                      className='text-[11px] sm:w-max break-words text-center font-normal p-2 py-1 border-gray-300 dark:border-gray-700'
                    >
                      {user.jobTitle}
                    </Badge>
                  )}
                </div>

                <div className='flex flex-wrap items-center gap-2 text-[11px] lg:text-xs text-gray-500 dark:text-gray-400'>
                  {user.username && (
                    <span className='inline-flex items-center gap-1'>
                      <Globe className='h-3 w-3' />
                      <span>@{user.username}</span>
                    </span>
                  )}

                  {user.createdAt && (
                    <>
                      <Separator orientation='vertical' className='h-3' />
                      <span className='inline-flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        <span>
                          {t('profileView.memberSince', {
                            date: toJalali(user.createdAt),
                          })}
                        </span>
                      </span>
                    </>
                  )}

                  {!user.isOnline && user.lastSeen && (
                    <>
                      <Separator
                        orientation='vertical'
                        className='hidden sm:inline-flex h-3'
                      />
                      <span className='inline-flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>
                          {t('profileView.lastSeen', {
                            date: toJalali(user.lastSeen),
                          })}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* وضعیت کلی + دکمه آمار */}
            <div className='flex items-center gap-2'>
              <Badge
                className={`text-[11px] h-6 px-2 hover:bg-inherit cursor-default ${
                  user.isOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800'
                }`}
              >
                {user.isOnline
                  ? t('profileView.online')
                  : t('profileView.offline')}
              </Badge>

              <Button
                variant='outline'
                size='sm'
                className='text-[11px] h-7 px-2 border-emerald-200/70 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 flex items-center gap-1'
                onClick={() => setIsTimelineOpen(true)}
              >
                <BarChart3 className='w-3.5 h-3.5' />
                <span>{t('profileView.activity24h')}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* اطلاعات اصلی */}
            <div className='lg:col-span-2 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <InfoRow
                  icon={UserIcon}
                  label={t('profileView.fields.fullName')}
                  value={user.name}
                />

                {user.username && (
                  <InfoRow
                    icon={Globe}
                    label={t('profileView.fields.username')}
                    value={`@${user.username}`}
                  />
                )}

                {user.email && (
                  <InfoRow
                    icon={Mail}
                    label={t('profileView.fields.email')}
                    value={user.email}
                  />
                )}

                {user.phone && (
                  <InfoRow
                    icon={Phone}
                    label={t('profileView.fields.phone')}
                    value={user.phone}
                  />
                )}

                {user.jobTitle && (
                  <InfoRow
                    icon={Briefcase}
                    label={t('profileView.fields.jobTitle')}
                    value={user.jobTitle}
                  />
                )}

                {region && (
                  <InfoRow
                    icon={Globe}
                    label={t('profileView.fields.region')}
                    value={region}
                  />
                )}
              </div>

              {hasWorkingDays && (
                <InfoRow
                  icon={Clock}
                  label={t('profileView.fields.workSchedule')}
                  value={`${formatWorkingDays(workSchedule!.workingDays)}، ${
                    workSchedule!.startHour
                  }:00 ${t('profileView.to')} ${workSchedule!.endHour}:00`}
                />
              )}
            </div>

            {/* ستون کناری – دستاوردها */}
            <div className='space-y-3'>
              <div className='bg-white/70 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-md px-3 py-3'>
                <h4 className='text-[12px] font-medium mb-2 text-gray-800 dark:text-gray-100'>
                  {t('profileView.achievements.title')}
                </h4>
                {achievements.length ? (
                  <div className='flex flex-wrap gap-1.5'>
                    {achievements.map((a, i) => (
                      <Badge
                        key={i}
                        className='text-[10px] h-5 px-2 bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 hover:bg-inherit cursor-pointer'
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className='text-[11px] text-gray-500'>
                    {t('profileView.achievements.empty')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className='my-2 mt-4' />

          {/* درباره من */}
          {user.bio ? (
            <div className='space-y-2'>
              <h3 className='text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                {t('profileView.about.title')}
              </h3>
              <div className='bg-gray-50 dark:bg-gray-900/60 rounded-md px-3 py-2'>
                <p className='text-[12px] leading-relaxed text-gray-700 dark:text-gray-300'>
                  {user.bio}
                </p>
              </div>
            </div>
          ) : (
            <div className='text-[12px] text-gray-500 dark:text-gray-400 py-2'>
              {t('profileView.about.empty')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileView
