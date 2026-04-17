import { z } from 'zod'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import { CalendarIcon, Loader } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { FileDropInput } from '@/components/ui/inputFile'
import { Button } from '@/components/ui/button'
import { Textarea } from '../../ui/textarea'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import useWorkspaceId from '@/hooks/use-workspace-id'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import { editTaskMutationFn } from '@/lib/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { TaskType } from '@/types/api.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { useTranslation } from 'react-i18next'
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant/task'
import {
  getTaskStatusLabels,
  getTaskPriorityLabels,
} from '@/utils/getTaskLabel'
/**
 * کامپوننت reusable برای انتخاب تاریخ + ساعت + دقیقه
 */
type DateTimeFieldProps = {
  label: string
  field: ControllerRenderProps<any, any>
}

function DateTimeField({ label, field }: DateTimeFieldProps) {
  const { t } = useTranslation()
  const value = field.value ? new Date(field.value) : undefined

  const updateDate = (updater: (date: Date) => void) => {
    const base = value ?? new Date()
    const newDate = new Date(base)
    updater(newDate)
    field.onChange(newDate)
  }

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant='outline'
              className={cn(
                'w-full flex-1 pl-3 text-right font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              {value ? (
                formatJalali(value, 'PPP HH:mm', {
                  locale: faIR,
                })
              ) : (
                <span>{t('tasks.editTask.datePicker.placeholder')}</span>
              )}
              <CalendarIcon className='mr-auto h-4 w-4 opacity-50' />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent className='w-auto p-3 space-y-3' align='start'>
          <Calendar
            mode='single'
            selected={value}
            locale={faIR}
            initialFocus
            onSelect={(selected) => {
              if (!selected) return

              const base = value ?? new Date()
              const newDate = new Date(selected)

              newDate.setHours(base.getHours())
              newDate.setMinutes(base.getMinutes())

              field.onChange(newDate)
            }}
          />

          <div className='flex gap-2'>
            {/* ساعت */}
            <div className='flex flex-col gap-1'>
              <p className='text-xs'>
                {t('tasks.editTask.datePicker.hourLabel')}
              </p>

              <Select
                value={value ? String(value.getHours()) : undefined}
                onValueChange={(hour) => {
                  updateDate((d) => d.setHours(Number(hour)))
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue
                    placeholder={t('tasks.editTask.datePicker.hourPlaceholder')}
                  />
                </SelectTrigger>

                <SelectContent className='max-h-[200px]'>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {String(hour).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* دقیقه */}
            <div className='flex flex-col gap-1'>
              <p className='text-xs'>
                {t('tasks.editTask.datePicker.minuteLabel')}
              </p>

              <Select
                value={value ? String(value.getMinutes()) : undefined}
                onValueChange={(minute) => {
                  updateDate((d) => d.setMinutes(Number(minute)))
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue
                    placeholder={t(
                      'tasks.editTask.datePicker.minutePlaceholder'
                    )}
                  />
                </SelectTrigger>

                <SelectContent className='max-h-[200px]'>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <SelectItem key={minute} value={String(minute)}>
                      {String(minute).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  )
}

export default function EditTaskForm({
  task,
  onClose,
}: {
  task: TaskType
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate, isPending } = useMutation({
    mutationFn: editTaskMutationFn,
  })

  const { data: memberData } = useGetWorkspaceMembers(workspaceId)
  const members = memberData?.data?.members || []

  // اعضای فضای کاری
  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || t('common.unknown')
    const initials = getAvatarFallbackText(name)
    const avatarColor = getAvatarColor(name)

    return {
      label: (
        <div className='flex items-center space-x-2 rtl:space-x-reverse'>
          <Avatar className='h-6 w-6 ml-1'>
            <AvatarImage src={member.userId?.profilePicture || ''} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    }
  })

  // --------- schema فرم با startDate + dueDate ---------
  const formSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, {
        message: t('tasks.editTask.validation.titleRequired'),
      }),
    description: z.string().trim(),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: t('tasks.editTask.validation.statusRequired'),
      }
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      {
        required_error: t('tasks.editTask.validation.priorityRequired'),
      }
    ),
    assignedTo: z
      .string()
      .trim()
      .min(1, {
        message: t('tasks.editTask.validation.assigneeRequired'),
      }),
    startDate: z.date({
      required_error: t('tasks.editTask.validation.startDateRequired'),
    }),
    dueDate: z.date({
      required_error: t('tasks.editTask.validation.dueDateRequired'),
    }),
    attachment: z.instanceof(File).optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      assignedTo: task?.assignedTo?._id ?? '',
      startDate: task?.startDate
        ? new Date(task.startDate as any)
        : task?.dueDate
        ? new Date(task.dueDate)
        : new Date(),
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      attachment: undefined,
    } as any,
  })

  const taskStatusList = Object.values(TaskStatusEnum)
  const taskPriorityList = Object.values(TaskPriorityEnum)

  // برچسب‌های فارسی برای وضعیت‌ها (می‌توان بعداً به i18n منتقل کرد)
  const statusLabels = getTaskStatusLabels(t)
  // برچسب‌های فارسی برای اولویت‌ها
  const priorityLabels = getTaskPriorityLabels(t)

  const statusOptions = taskStatusList.map((status) => ({
    value: status,
    label: statusLabels[status] || status,
  }))

  const priorityOptions = taskPriorityList.map((priority) => ({
    value: priority,
    label: priorityLabels[priority] || priority,
  }))

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return

    const formData = new FormData()

    formData.append('workspaceId', workspaceId)
    formData.append('projectId', task.project?._id ?? '')
    formData.append('title', values.title)
    formData.append('description', values.description || '')
    formData.append('assignedTo', values.assignedTo)
    formData.append('status', values.status)
    formData.append('priority', values.priority)
    formData.append('startDate', values.startDate.toISOString())
    formData.append('dueDate', values.dueDate.toISOString())

    if (values.attachment) {
      formData.append('attachment', values.attachment)
    }

    mutate(
      {
        workspaceId,
        projectId: task.project?._id ?? '',
        taskId: task._id,
        data: formData,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['project-analytics', task.project?._id],
          })

          queryClient.invalidateQueries({
            queryKey: ['all-tasks', workspaceId],
          })

          toast({
            title: t('tasks.editTask.toast.successTitle'),
            description: t('tasks.editTask.toast.successDescription'),
            variant: 'success',
          })

          onClose()
        },
        onError: () => {
          toast({
            title: t('tasks.editTask.toast.errorTitle'),
            description: t('tasks.editTask.toast.errorDescription'),
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <div className='h-full'>
        <Form {...form}>
          <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
            {/* عنوان */}
            <div>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                      {t('tasks.editTask.fields.title.label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'tasks.editTask.fields.title.placeholder'
                        )}
                        className='!h-[48px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* توضیحات */}
            <div>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                      {t('tasks.editTask.fields.description.label')}
                      <span className='text-xs font-extralight mr-2'>
                        ({t('tasks.editTask.fields.description.optional')})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={1}
                        placeholder={t(
                          'tasks.editTask.fields.description.placeholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* مسئول */}
            <div>
              <FormField
                control={form.control}
                name='assignedTo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tasks.editTask.fields.assignedTo.label')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'tasks.editTask.fields.assignedTo.placeholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className='w-full max-h-[200px] overflow-y-auto scrollbar'>
                          {membersOptions?.map((option) => (
                            <SelectItem
                              className='cursor-pointer'
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* تاریخ شروع */}
            <div className='!mt-2'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <DateTimeField
                    label={t('tasks.editTask.fields.startDate.label')}
                    field={field}
                  />
                )}
              />
            </div>

            {/* تاریخ سررسید */}
            <div className='!mt-2'>
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <DateTimeField
                    label={t('tasks.editTask.fields.dueDate.label')}
                    field={field}
                  />
                )}
              />
            </div>

            {/* وضعیت */}
            <div>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tasks.editTask.fields.status.label')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className='!text-muted-foreground !capitalize'
                            placeholder={t(
                              'tasks.editTask.fields.status.placeholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions?.map((status) => (
                          <SelectItem
                            className='!capitalize'
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* اولویت */}
            <div>
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tasks.editTask.fields.priority.label')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'tasks.editTask.fields.priority.placeholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions?.map((priority) => (
                          <SelectItem
                            className='!capitalize'
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* فایل پیوست */}
            <div>
              <FormField
                control={form.control}
                name='attachment'
                render={({ field }) => {
                  const attachmentPreview = task?.attachment ?? undefined

                  return (
                    <FormItem>
                      <FormLabel>
                        {t('tasks.editTask.fields.attachment.label')}
                      </FormLabel>
                      {attachmentPreview && (
                        <div className='bg-slate-50 dark:bg-slate-900 p-3 rounded-lg'>
                          <a
                            href={attachmentPreview}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <div className='flex justify-between'>
                              <p>
                                {t(
                                  'tasks.editTask.fields.attachment.previewTitle'
                                )}
                              </p>
                              <p className='text-sm '>
                                {t(
                                  'tasks.editTask.fields.attachment.previewAction'
                                )}
                              </p>
                            </div>
                            <p className='line-clamp-3 opacity-50 text-right text-xs mt-1'>
                              {attachmentPreview}
                            </p>
                          </a>
                        </div>
                      )}

                      <FormControl>
                        <FileDropInput
                          onFileChange={(file) => field.onChange(file)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            <Button
              className='flex place-self-start h-[40px] text-white font-semibold'
              type='submit'
              disabled={isPending}
            >
              {isPending && <Loader className='animate-spin ml-2' />}
              {t('tasks.editTask.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
