import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader, Paperclip, Upload, X } from 'lucide-react'

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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { createCommentMutationFn } from '@/lib/api'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  content: z.string().trim().min(1, {
    message: 'متن کامنت الزامی است',
  }),
  attachment: z.instanceof(File).optional(),
})

type CreateCommentFormValues = z.infer<typeof formSchema>

type CompactFileInputProps = {
  value?: File
  onChange: (file: File | undefined) => void
}

function CompactFileInput({ value, onChange }: CompactFileInputProps) {
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
            : 'border-border bg-background',
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
              فایل را بکشید اینجا یا انتخاب کنید
            </span>
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => inputRef.current?.click()}
          >
            <Upload className='size-4 ml-1' />
            انتخاب فایل
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
  const workspaceId = useWorkspaceId()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: createCommentMutationFn,
  })

  const form = useForm<CreateCommentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      attachment: undefined,
    },
  })

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
            title: 'موفق',
            description: 'کامنت با موفقیت ثبت شد',
            variant: 'success',
          })

          form.reset()
          onClose?.()
        },
        onError: (error: any) => {
          toast({
            title: 'خطا',
            description: error?.message || 'ثبت کامنت انجام نشد',
            variant: 'destructive',
          })
        },
      },
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
                  <div className='rounded-md border bg-background p-2'>
                    <Textarea
                      rows={2}
                      placeholder='نظر و یا بازخورد خود را بنویسید...'
                      className='min-h-[80px] border-0 shadow-none focus-visible:ring-0 resize-none'
                      {...field}
                    />

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
            className='flex place-self-start h-[40px] text-white font-semibold '
            type='submit'
            disabled={isPending}
          >
            {isPending && <Loader className='ml-2 animate-spin' />}
            ثبت کامنت
          </Button>
        </form>
      </Form>
    </div>
  )
}
