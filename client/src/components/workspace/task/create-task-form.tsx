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
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import useWorkspaceId from '@/hooks/use-workspace-id'

import useGetProjectsInWorkspaceQuery from '@/hooks/api/use-get-projects'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createTaskMutationFn } from '@/lib/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next' // یا هر کتابخانه i18n که استفاده می‌کنی
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant/task'
import {
  getTaskPriorityLabels,
  getTaskStatusLabels,
} from '@/utils/getTaskLabel'

/**
 * کامپوننت reusable برای انتخاب تاریخ + ساعت + دقیقه
 */
type DateTimeFieldProps = {
  label: string
  field: ControllerRenderProps<any, any>
}

function DateTimeField({ label, field }: DateTimeFieldProps) {
  const { t } = useTranslation() // namespace پیشنهادی
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
                <span>{t('tasks.createTask.date.select_date')}</span>
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
              <p className='text-xs'>{t('tasks.createTask.date.hour_label')}</p>

              <Select
                value={value ? String(value.getHours()) : undefined}
                onValueChange={(hour) => {
                  updateDate((d) => d.setHours(Number(hour)))
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue
                    placeholder={
                      t('tasks.createTask.date.hour_placeholder') ?? ''
                    }
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
                {t('tasks.createTask.date.minute_label')}
              </p>

              <Select
                value={value ? String(value.getMinutes()) : undefined}
                onValueChange={(minute) => {
                  updateDate((d) => d.setMinutes(Number(minute)))
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue
                    placeholder={
                      t('tasks.createTask.date.minute_placeholder') ?? '  '
                    }
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

export default function CreateTaskForm(props: {
  projectId?: string
  onClose: () => void
}) {
  const { projectId, onClose } = props
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate, isPending } = useMutation({
    mutationFn: createTaskMutationFn,
  })

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
  })

  const { data: memberData } = useGetWorkspaceMembers(workspaceId)

  const projects = data?.data?.projects || []
  const members = memberData?.data?.members || []

  // پروژه‌های فضای کاری
  const projectOptions = projects?.map((project) => ({
    label: (
      <div className='flex items-center gap-1'>
        <span>{project.emoji}</span>
        <span>{project.name}</span>
      </div>
    ),
    value: project._id,
  }))

  // اعضای فضای کاری
  const membersOptions = members?.map((member) => {
    const name =
      member.userId?.name || t('tasks.createTask.form.assigned_to.unknown')
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

  // ---------------- schema فرم با startDate ----------------
  const formSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, {
        message: t('tasks.createTask.form.title_required'),
      }),
    description: z.string().trim(),
    projectId: z
      .string()
      .trim()
      .min(1, {
        message: t('tasks.createTask.form.project_required'),
      }),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: t('tasks.createTask.form.status_required'),
      }
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      {
        required_error: t('tasks.createTask.form.priority_required'),
      }
    ),
    assignedTo: z
      .string()
      .trim()
      .min(1, {
        message: t('tasks.createTask.form.assigned_to_required'),
      }),
    startDate: z.date({
      required_error: t('tasks.createTask.form.start_date_required'),
    }),
    dueDate: z.date({
      required_error: t('tasks.createTask.form.due_date_required'),
    }),
    attachment: z.instanceof(File).optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      attachment: undefined,
      projectId: projectId ? projectId : '',
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
    formData.append('projectId', values.projectId)
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
      { workspaceId, projectId: values.projectId, data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['project-analytics', projectId],
          })

          queryClient.invalidateQueries({
            queryKey: ['all-tasks', workspaceId],
          })

          toast({
            title: t('tasks.createTask.toast.success.title'),
            description: t('tasks.createTask.toast.success.description'),
            variant: 'success',
          })

          onClose()
        },
        onError: () => {
          // اینجا پیام خام API نمایش داده نمی‌شود
          toast({
            title: t('tasks.createTask.toast.error.title'),
            description: t('tasks.createTask.toast.error.description'),
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <div className='h-full'>
        <div className='my-5 pb-2 border-b'>
          <p className='text-muted-foreground text-sm leading-tight text-center sm:text-right'>
            {t('tasks.createTask.form.subtitle')}
          </p>
        </div>
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
                      {t('tasks.createTask.form.title_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          t('tasks.createTask.form.title_placeholder') ?? ''
                        }
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
                      {t('tasks.createTask.form.description_label')}
                      <span className='text-xs font-extralight mr-2'>
                        {t('tasks.createTask.form.optional')}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={1}
                        placeholder={
                          t('tasks.createTask.form.description_placeholder') ??
                          ''
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* پروژه */}
            {!projectId && (
              <div>
                <FormField
                  control={form.control}
                  name='projectId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('tasks.createTask.form.project_label')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                t(
                                  'tasks.createTask.form.project_placeholder'
                                ) as string
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoading && (
                            <div className='my-2'>
                              <Loader className='w-4 h-4 place-self-center flex animate-spin' />
                            </div>
                          )}
                          <div className='w-full max-h-[200px] overflow-y-auto scrollbar'>
                            {projectOptions?.map((option) => (
                              <SelectItem
                                key={option.value}
                                className='!capitalize cursor-pointer'
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
            )}

            {/* مسئول */}
            <div>
              <FormField
                control={form.control}
                name='assignedTo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tasks.createTask.form.assigned_to_label')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              t(
                                'tasks.createTask.form.assigned_to_placeholder'
                              ) as string
                            }
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
                    label={t('tasks.createTask.form.start_date_label')}
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
                    label={t('tasks.createTask.form.due_date_label')}
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
                      {t('tasks.createTask.form.status_label')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className='!text-muted-foreground !capitalize'
                            placeholder={
                              t(
                                'tasks.createTask.form.status_placeholder'
                              ) as string
                            }
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
                      {t('tasks.createTask.form.priority_label')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              t(
                                'tasks.createTask.form.priority_placeholder'
                              ) as string
                            }
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tasks.createTask.form.attachment_label')}
                    </FormLabel>
                    <FormControl>
                      <FileDropInput
                        onFileChange={(file) => field.onChange(file)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              className='flex place-self-start h-[40px] text-white font-semibold'
              type='submit'
              disabled={isPending}
            >
              {isPending && <Loader className='animate-spin ml-2' />}
              {t('tasks.createTask.form.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
