import { Link } from 'react-router-dom'

// تابع بهبود یافته برای پشتیبانی از یوزرنیم‌های فارسی و Unicode
type renderCommentPropsType = {
  content: string
  workspaceId: string
}
export const renderCommentContent = (props: renderCommentPropsType) => {
  // الگوی جدید برای پشتیبانی از تمام کاراکترهای Unicode
  const mentionRegex = /@([^\s@]+)/gu

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(props.content)) !== null) {
    // متن قبل از منشن
    const textBefore = props.content.substring(lastIndex, match.index)
    if (textBefore) {
      parts.push(textBefore)
    }
    const username = match[1]
    // منشن
    parts.push(
      <Link
        key={match.index}
        to={`/workspace/${props.workspaceId}/profile/${username}`}
        className='text-blue-600 dark:text-blue-400 hover:underline'
        target='_blank'
        rel='noopener noreferrer'
      >
        @{username}
      </Link>,
    )

    lastIndex = match.index + match[0].length
  }

  // متن بعد از آخرین منشن
  const textAfter = props.content.substring(lastIndex)
  if (textAfter) {
    parts.push(textAfter)
  }

  return parts.length > 0 ? parts : props.content
}
