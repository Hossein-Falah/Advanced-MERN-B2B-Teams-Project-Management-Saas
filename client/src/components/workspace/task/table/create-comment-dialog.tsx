import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getAllCommentQueryFn } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import CreateCommentForm from './create-comment-form'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import AttachmentDownload from '@/components/ui/attachment-download'
import { motion, AnimatePresence } from 'framer-motion'

const CommentsDialog = ({
  task,
  isOpen,
  onClose,
}: {
  task: any
  isOpen: boolean
  onClose: () => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['all-comments', task?.workspace, task?.id],
    queryFn: () =>
      getAllCommentQueryFn({
        taskId: task.id,
        workspaceId: task.workspace,
      }),
    staleTime: 0,
    enabled: isOpen && !!task?.id && !!task?.workspace,
  })
  // TODO
  const comments: any[] = (data?.comments?.comments || []).sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const attachmentPreview = task?.attachment ?? undefined

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg my-5 border-0'>
        <DialogHeader>
          <DialogTitle className='mt-4'>{task?.title}</DialogTitle>
        </DialogHeader>

        {/* task description */}
        <div className='space-y-3'>
          <p className='text-sm leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-line break-all'>
            {task?.description || 'توضیحی برای این وظیفه ثبت نشده است.'}
          </p>

          {attachmentPreview && (
            <AttachmentDownload
              url={attachmentPreview}
              label='دانلود فایل پیوست '
            />
          )}
        </div>

        {/* create comment */}
        <CreateCommentForm taskId={task.id} />
        <hr className='opacity-40 my-3' />

        {/*show comments */}
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
          ) : comments.length > 0 ? (
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
                          <Avatar className='h-6 w-6'>
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
                        {comment.content}
                      </p>

                      {comment?.attachment && (
                        <AttachmentDownload
                          url={comment?.attachment}
                          label='دانلود فایل پیوست'
                        />
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              هنوز کامنتی ثبت نشده است.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentsDialog
