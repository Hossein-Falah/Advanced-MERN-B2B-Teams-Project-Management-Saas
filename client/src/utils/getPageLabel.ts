import { t } from 'i18next'

export const getPageLabel = (pathname: string) => {
  try {
    // 2 segment
    if (pathname.includes('/profile/settings'))
      return [t('header.pageLabel.profile'), t('header.pageLabel.settings')]

    // 1 segment
    if (pathname.includes('/project/')) return [t('header.pageLabel.project')]

    if (pathname.includes('/settings')) return [t('header.pageLabel.settings')]

    if (pathname.includes('/tasks')) return [t('header.pageLabel.tasks')]

    if (pathname.includes('/members')) return [t('header.pageLabel.members')]

    if (pathname.includes('/profile')) return [t('header.pageLabel.profile')]

    return ['']
  } catch (error) {
    // هیچ پیام API نمایش داده نشود
    console.error(error)
    return [t('header.pageLabel.errors.unknown')]
  }
}
