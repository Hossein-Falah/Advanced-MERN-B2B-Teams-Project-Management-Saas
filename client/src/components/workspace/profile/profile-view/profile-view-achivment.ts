import { t } from 'i18next'

const getAchievements = (user: any): string[] => {
  const achievements: string[] = []

  try {
    // سابقه عضویت
    const created = user.createdAt
      ? new Date(user.createdAt)
      : user._id
      ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000)
      : new Date()

    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays >= 30 && diffDays < 365) {
      achievements.push(t('profileView.achievements.member_1_month'))
    }

    if (diffDays >= 365 && diffDays < 3650) {
      achievements.push(t('profileView.achievements.member_1_year'))
    }

    if (diffDays >= 3650) {
      achievements.push(t('profileView.achievements.member_10_years'))
    }

    // وضعیت فعالیت
    if (user.isOnline) {
      achievements.push(t('profileView.achievements.online_now'))
    } else if (user.lastSeen) {
      const lastSeen = new Date(user.lastSeen)
      const diffHours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60)

      if (diffHours <= 24) {
        achievements.push(t('profileView.achievements.active_last_24h'))
      }
    }

    // تکمیل پروفایل
    const hasAvatar = !!user.profilePicture
    const hasBio = !!user.bio
    const hasJob = !!user.jobTitle

    const score = (hasAvatar ? 1 : 0) + (hasBio ? 1 : 0) + (hasJob ? 1 : 0)

    if (score >= 3) {
      achievements.push(t('profileView.achievements.profile_completed'))
    }

    return achievements
  } catch {
    // جلوگیری از نمایش هر پیام خام از API
    return [t('errors.unknown')]
  }
}

export default getAchievements
