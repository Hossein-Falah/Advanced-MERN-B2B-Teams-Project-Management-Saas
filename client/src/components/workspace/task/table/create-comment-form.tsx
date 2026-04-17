import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader, Paperclip, Upload, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { toast } from '@/hooks/use-toast'
import { createCommentMutationFn } from '@/lib/api/api'
import { cn } from '@/lib/utils'
import { getAllMentionableUsersQueryFn } from '@/lib/api/task-comments'
import { MentionableUsersType } from '@/types/task-comment.type'

// i18n
import { useTranslation } from 'react-i18next'

// ---------- Schema با پیام ترجمه‌شده ----------
const formSchema = (t: (key: string) => string) =>
  z.object({
    content: z
      .string()
      .trim()
      .min(1, {
        message: t('tasks.comment.form.contentRequired'),
      }),
    attachment: z.instanceof(File).optional(),
  })

type CreateCommentFormValues = z.infer<ReturnType<typeof formSchema>>

type CompactFileInputProps = {
  value?: File
  onChange: (file: File | undefined) => void
}

function CompactFileInput({ value, onChange }: CompactFileInputProps) {
  const { t } = useTranslation()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const selectedFile = files[0]
    onChange(selectedFile)
  }

  return (
    <div
      className={cn(
        'mt-2 rounded-md border border-dashed transition-all',
        value
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : isDragging
          ? 'border-primary bg-accent/40'
          : 'border-border bg-background'
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type='file'
        className='hidden'
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!value ? (
        <div className='flex items-center justify-between gap-3 p-3'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Paperclip className='size-4' />
            <span className='text-xs sm:text-sm'>
              {t('tasks.comment.attachment.dropOrSelect')}
            </span>
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => inputRef.current?.click()}
          >
            <Upload className='size-4 ml-1' />
            {t('tasks.comment.attachment.selectFile')}
          </Button>
        </div>
      ) : (
        <div className='flex items-center justify-between gap-3 p-3'>
          <div className='min-w-0 flex items-center gap-2 text-green-700 dark:text-green-400'>
            <Paperclip className='size-4 shrink-0' />
            <div className='min-w-0'>
              <p className='truncate text-xs sm:text-sm font-medium'>
                {value.name}
              </p>
              <p className='text-[11px] opacity-80'>
                {(value.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onChange(undefined)}
          >
            <X className='size-4' />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function CreateCommentForm(props: {
  taskId: string
  onClose?: () => void
}) {
  const { taskId, onClose } = props
  const { t } = useTranslation()
  const workspaceId = useWorkspaceId()
  const queryClient = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mention state management
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentionList, setShowMentionList] = useState(false)
  const [mentionPosition, setMentionPosition] = useState(0)
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)

  const debouncedMentionQuery = useDebounce(mentionQuery, 300)

  const { data, isLoading: isMentionLoading } = useQuery({
    queryKey: ['mentionable-users', debouncedMentionQuery, workspaceId],
    queryFn: () =>
      getAllMentionableUsersQueryFn({
        query: debouncedMentionQuery,
        workspaceId,
      }),
  })
  const mentionableUsers = data?.data?.users
  const { mutate, isPending } = useMutation({
    mutationFn: createCommentMutationFn,
  })

  const form = useForm<CreateCommentFormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      content: '',
      attachment: undefined,
    },
  })

  // هندل انتخاب منشن
  const handleSelectMention = useCallback(
    (user: MentionableUsersType) => {
      const currentValue = form.getValues('content')
      const beforeMention = currentValue.substring(0, mentionPosition)
      const afterMention = currentValue.substring(
        mentionPosition + mentionQuery.length + 1 // +1 برای '@'
      )

      const username = user.username || t('tasks.comment.mention.noUsername')
      const newValue = `${beforeMention}${username}${afterMention}`
      form.setValue('content', newValue)

      // جابه‌جایی کرسر بعد از منشن
      setTimeout(() => {
        if (textareaRef.current) {
          const cursorPos = beforeMention.length + username.length + 2 // +1 برای '@' و +1 برای فاصله
          textareaRef.current.selectionStart = cursorPos
          textareaRef.current.selectionEnd = cursorPos
        }
      }, 0)

      setShowMentionList(false)
      setMentionQuery('')
    },
    [form, mentionPosition, mentionQuery, t]
  )

  // تشخیص منشن داخل متن
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const cursorPos = e.target.selectionStart || 0

      // پیدا کردن آخرین '@' قبل از کرسر
      let startPos = cursorPos - 1
      while (
        startPos >= 0 &&
        value[startPos] !== '@' &&
        !/\s/.test(value[startPos])
      ) {
        startPos--
      }

      // اگر تریگر منشن پیدا شد
      if (startPos >= 0 && value[startPos] === '@') {
        const wordStart = startPos + 1
        const wordEnd = cursorPos
        const mentionWord = value.substring(wordStart, wordEnd)

        setMentionQuery(mentionWord)
        setMentionPosition(wordStart)
        setShowMentionList(true)
        setSelectedMentionIndex(0)
      } else {
        setShowMentionList(false)
      }
    },
    []
  )

  // ناوبری با کیبورد در لیست منشن
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showMentionList && (mentionableUsers?.length || 0) > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedMentionIndex(
            (prev) => (prev + 1) % (mentionableUsers?.length || 0)
          )
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedMentionIndex(
            (prev) =>
              (prev - 1 + (mentionableUsers?.length || 0)) %
              (mentionableUsers?.length || 0)
          )
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const selectedUser = mentionableUsers?.[selectedMentionIndex]
          if (selectedUser) {
            handleSelectMention(selectedUser)
          }
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setShowMentionList(false)
        }
      }
    },
    [
      showMentionList,
      mentionableUsers,
      selectedMentionIndex,
      handleSelectMention,
    ]
  )

  // هندل ارسال فرم
  const onSubmit = (values: CreateCommentFormValues) => {
    if (isPending) return

    const formData = new FormData()
    formData.append('content', values.content)

    if (values.attachment) {
      formData.append('attachment', values.attachment)
    }

    mutate(
      {
        workspaceId,
        taskId,
        data: formData,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['all-comments', workspaceId, taskId],
          })

          toast({
            title: t('tasks.comment.form.successTitle'),
            description: t('tasks.comment.form.successDescription'),
            variant: 'success',
          })

          form.reset()
          onClose?.()
        },
        onError: (error: any) => {
          // نگاشت امن خطا – بدون نمایش متن خام error.message
          let errorKey = 'errors.default'

          if (error?.name === 'AxiosError' || error?.isAxiosError) {
            const status = error?.response?.status
            if (!status) {
              // احتمالاً مشکل شبکه
              errorKey = 'errors.network'
            } else if (status >= 500) {
              errorKey = 'errors.unknown'
            } else if (status === 408) {
              errorKey = 'errors.timeout'
            } else if (status === 400 || status === 422) {
              errorKey = 'errors.validation'
            }
          }

          toast({
            title: t('tasks.comment.form.errorTitle'),
            description:
              t('tasks.comment.form.errorDescription') || t(errorKey),
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <Form {...form}>
        <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='rounded-md border bg-background p-2 relative'>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      rows={2}
                      placeholder={t('tasks.comment.form.placeholder')}
                      className='min-h-[80px] border-0 shadow-none focus-visible:ring-0 resize-none'
                      onChange={(e) => {
                        field.onChange(e)
                        handleTextChange(e)
                      }}
                      onKeyDown={handleKeyDown}
                    />

                    {showMentionList && (
                      <div className='absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-md shadow-lg z-10'>
                        {isMentionLoading ? (
                          <div className='p-2 text-center'>
                            {t('tasks.comment.mention.loading')}
                          </div>
                        ) : mentionableUsers?.length === 0 ? (
                          <div className='p-2 text-center'>
                            {t('tasks.comment.mention.noUserFound')}
                          </div>
                        ) : (
                          mentionableUsers?.map((user, index) => (
                            <div
                              key={user._id}
                              className={cn(
                                'px-3 py-2 cursor-pointer hover:bg-accent',
                                index === selectedMentionIndex && 'bg-accent'
                              )}
                              onClick={() => handleSelectMention(user)}
                            >
                              {user.username ||
                                t('tasks.comment.mention.noUsername')}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name='attachment'
                      render={({ field: attachmentField }) => (
                        <CompactFileInput
                          value={attachmentField.value}
                          onChange={attachmentField.onChange}
                        />
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className='flex place-self-start h-[40px] text-white font-semibold'
            type='submit'
            disabled={isPending}
          >
            {isPending && <Loader className='ml-2 animate-spin' />}
            {t('tasks.comment.form.submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
