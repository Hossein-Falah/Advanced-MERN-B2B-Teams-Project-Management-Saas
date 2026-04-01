export const getPageLabel = (pathname: string) => {
  //2 segment
  if (pathname.includes('/profile/settings')) return [' پروفایل', 'تنظیمات']
  //1 segment
  if (pathname.includes('/project/')) return ['پروژه']
  if (pathname.includes('/settings')) return ['تنظیمات']
  if (pathname.includes('/tasks')) return ['وظایف']
  if (pathname.includes('/members')) return ['اعضا']
  if (pathname.includes('/profile')) return ['پروفایل ']

  return [''] // Default label
}
