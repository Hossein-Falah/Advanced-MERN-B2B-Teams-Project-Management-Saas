// attachment-download.tsx
import { Download, Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type AttachmentDownloadProps = {
  url?: string
  labelKey?: string // کلید ترجمه برای لیبل
}

const AttachmentDownload = ({
  url,
  labelKey = 'attachmentDownload.label',
}: AttachmentDownloadProps) => {
  const { t } = useTranslation()

  if (!url) return null

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center justify-between rounded-lg border bg-slate-200 dark:bg-slate-900 px-3 py-2 text-sm hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors'
    >
      <div className='flex items-center gap-2 min-w-0'>
        <Paperclip className='h-4 w-4 shrink-0 text-muted-foreground' />
        <span className='truncate'>{t(labelKey)}</span>
      </div>

      <div className='flex items-center gap-1 text-primary shrink-0'>
        <Download className='h-4 w-4' />
        <span className='text-xs'>{t('attachmentDownload.button')}</span>
      </div>
    </a>
  )
}

export default AttachmentDownload
