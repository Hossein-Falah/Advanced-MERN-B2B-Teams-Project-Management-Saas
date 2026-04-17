import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getAllCommentQueryFn } from '@/lib/api/api'
import { useQuery } from '@tanstack/react-query'
import CreateCommentForm from './create-comment-form'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import AttachmentDownload from '@/components/ui/attachment-download'
import { motion, AnimatePresence } from 'framer-motion'
import { Description } from '@radix-ui/react-dialog'
import { TaskType } from '@/types/api.type'
import { renderCommentContent } from '@/utils/renderCommentContent'

// i18n
import { useTranslation } from 'react-i18next'

const CommentsDialog = ({
  task,
  isOpen,
  onClose,
}: {
  task: TaskType & Record<string, any>
  isOpen: boolean
  onClose: () => void
}) => {
  const { t } = useTranslation()

  // call api
  const { data, isLoading } = useQuery({
    queryKey: ['all-comments', task?.workspace, task?.id],
    queryFn: () =>
      getAllCommentQueryFn({
        taskId: task.id,
        workspaceId: task.workspace,
      }),
    enabled: isOpen && !!task?.id && !!task?.workspace,
  })

  if (!task) return null

  const comments = data?.data?.comments
  const attachmentPreview = task?.attachment ?? undefined

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg my-5 border-0'>
        <DialogHeader>
          <DialogTitle className='mt-4 flex flex-col gap-2 md:flex-row justify-between break-all'>
            <p>{task?.title}</p>
            <p className='text-xs font-normal '>
              {task.dueDate
                ? formatJalali(new Date(task.dueDate), 'PPP HH:mm', {
                    locale: faIR,
                  })
                : null}
            </p>
          </DialogTitle>

          <Description className='text-sm leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-line break-all'>
            {task?.description || t('tasks.dialog.noDescription')}
          </Description>
        </DialogHeader>

        {/* task attachment */}
        <div className='space-y-3'>
          {attachmentPreview && (
            <AttachmentDownload
              url={attachmentPreview}
              labelKey={t('tasks.dialog.attachmentLabel')}
            />
          )}
        </div>

        {/* create comment */}
        <CreateCommentForm taskId={task.id} />
        <hr className='opacity-40 my-3' />

        {/* show comments */}
        <div className='space-y-3 max-h-[400px] overflow-y-auto '>
          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='rounded-lg border p-3 bg-slate-50 dark:bg-slate-900 animate-pulse'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded' />
                    <div className='h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded' />
                  </div>
                  <div className='h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2' />
                  <div className='h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded' />
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className='space-y-3 max-h-[400px] overflow-y-auto'>
              <AnimatePresence initial={false}>
                {comments.map((comment) => {
                  const name = comment.user?.name
                  const initials = getAvatarFallbackText(name)
                  const avatarColor = getAvatarColor(name)

                  return (
                    <motion.div
                      layout
                      key={comment.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className='rounded-lg border p-3 bg-slate-50 dark:bg-slate-900'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-1'>
                          <Avatar
                            toUser={comment.user.username}
                            className='h-8 w-8'
                          >
                            <AvatarImage
                              src={comment.user.profilePicture || ''}
                              alt={t('tasks.dialog.avatarAlt')}
                            />
                            <AvatarFallback className={avatarColor}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <span className='block text-ellipsis w-[100px] truncate text-sm font-medium'>
                            {name}
                          </span>
                        </div>

                        {comment.createdAt && (
                          <span className='text-xs text-muted-foreground'>
                            {formatJalali(new Date(comment.createdAt), 'PPP', {
                              locale: faIR,
                            })}
                          </span>
                        )}
                      </div>

                      <p className='text-sm text-slate-700 dark:text-slate-300 leading-6 my-2'>
                        {renderCommentContent({
                          content: comment.content,
                          workspaceId: comment.workspace,
                        })}
                      </p>

                      {comment?.attachment && (
                        <AttachmentDownload
                          url={comment.attachment}
                          labelKey={t('tasks.dialog.attachmentLabel')}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              {t('tasks.dialog.noComments')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentsDialog
