const getAchievements = (user: any): string[] => {
  const achievements: string[] = []

  // سابقه عضویت
  const created = user.createdAt
    ? new Date(user.createdAt)
    : user._id
      ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000)
      : new Date()

  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays >= 30 && diffDays < 365) {
    achievements.push('🎉 بیش از ۱ ماه سابقه')
  }
  if (diffDays >= 365 && diffDays < 3650) {
    achievements.push('🏅 بیش از ۱ سال همراه ما')
  }
  if (diffDays >= 3650) {
    achievements.push('👑 بیش از ۱۰ سال سابقه')
  }

  // وضعیت فعالیت
  if (user.isOnline) {
    achievements.push('🟢 فعال در حال حاضر')
  } else if (user.lastSeen) {
    // اگر در ۲۴ ساعت گذشته آنلاین بوده
    const lastSeen = new Date(user.lastSeen)
    const diffHours = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60)
    if (diffHours <= 24) {
      achievements.push('🔥 کاربر فعال (آخرین ۲۴ ساعت)')
    }
  }

  // تکمیل پروفایل
  const hasAvatar = !!user.profilePicture
  const hasBio = !!user.bio
  const hasJob = !!user.jobTitle

  // پروفایل نسبتاً کامل (خلاقانه‌تر)
  const score = (hasAvatar ? 1 : 0) + (hasBio ? 1 : 0) + (hasJob ? 1 : 0)

  if (score >= 3) {
    achievements.push('⭐ پروفایل تقریبا کامل')
  }

  return achievements
}
export default getAchievements
