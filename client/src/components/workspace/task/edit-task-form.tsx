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
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import { editTaskMutationFn } from '@/lib/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { TaskType } from '@/types/api.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'

/**
 * کامپوننت reusable برای انتخاب تاریخ + ساعت + دقیقه
 */
type DateTimeFieldProps = {
  label: string
  field: ControllerRenderProps<any, any>
}

function DateTimeField({ label, field }: DateTimeFieldProps) {
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
                !value && 'text-muted-foreground',
              )}
            >
              {value ? (
                formatJalali(value, 'PPP HH:mm', {
                  locale: faIR,
                })
              ) : (
                <span>انتخاب تاریخ</span>
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
              <p className='text-xs'>ساعت :</p>

              <Select
                value={value ? String(value.getHours()) : undefined}
                onValueChange={(hour) => {
                  updateDate((d) => d.setHours(Number(hour)))
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue placeholder='ساعت' />
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
              <p className='text-xs'>دقیقه :</p>

              <Select
                value={value ? String(value.getMinutes()) : undefined}
                onValueChange={(minute) => {
                  updateDate((d) => d.setMinutes(Number(minute)))
                }}
              >
                <SelectTrigger className='w-[80px]'>
                  <SelectValue placeholder='دقیقه' />
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
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate, isPending } = useMutation({
    mutationFn: editTaskMutationFn,
  })

  const { data: memberData } = useGetWorkspaceMembers(workspaceId)
  const members = memberData?.members || []

  // اعضای فضای کاری
  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || 'ناشناس'
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
    title: z.string().trim().min(1, {
      message: 'عنوان وظیفه  الزامی است',
    }),
    description: z.string().trim(),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: 'وضعیت الزامی است',
      },
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      {
        required_error: 'اولویت الزامی است',
      },
    ),
    assignedTo: z.string().trim().min(1, {
      message: 'انتخاب مسئول الزامی است',
    }),
    startDate: z.date({
      required_error: 'تاریخ شروع الزامی است',
    }),
    dueDate: z.date({
      required_error: 'تاریخ سررسید الزامی است',
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

  // برچسب‌های فارسی برای وضعیت‌ها
  const statusLabels: Record<string, string> = {
    BACKLOG: 'لیست انتظار',
    TODO: 'برای انجام',
    IN_PROGRESS: 'در حال انجام',
    IN_REVIEW: 'در حال بررسی',
    DONE: 'انجام شده',
  }

  // برچسب‌های فارسی برای اولویت‌ها
  const priorityLabels: Record<string, string> = {
    LOW: 'کم',
    MEDIUM: 'متوسط',
    HIGH: 'زیاد',
    URGENT: 'فوری',
  }

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
            title: 'موفق',
            description: 'وظیفه  با موفقیت به‌روزرسانی شد',
            variant: 'success',
          })

          onClose()
        },
        onError: (error: any) => {
          toast({
            title: 'خطا',
            description: error.message,
            variant: 'destructive',
          })
        },
      },
    )
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <div className='h-full'>
        <div className='my-5 pb-2 border-b'>
          <p className='text-muted-foreground text-sm leading-tight text-center sm:text-right'>
            ویرایش و بروزرسانی اطلاعات وظیفه
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
                      عنوان وظیفه
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='بازطراحی وب‌سایت'
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
                      توضیحات وظیفه
                      <span className='text-xs font-extralight mr-2'>
                        (اختیاری)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={1} placeholder='توضیحات' {...field} />
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
                    <FormLabel>مسئول</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='یک مسئول انتخاب کنید' />
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
                  <DateTimeField label='تاریخ شروع' field={field} />
                )}
              />
            </div>

            {/* تاریخ سررسید */}
            <div className='!mt-2'>
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <DateTimeField label='تاریخ سررسید' field={field} />
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
                    <FormLabel>وضعیت</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className='!text-muted-foreground !capitalize'
                            placeholder='یک وضعیت انتخاب کنید'
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
                    <FormLabel>اولویت</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='یک اولویت انتخاب کنید' />
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
                      <FormLabel>فایل پیوست</FormLabel>
                      {attachmentPreview && (
                        <div className='bg-slate-50 dark:bg-slate-900 p-3 rounded-lg'>
                          <a
                            href={attachmentPreview}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <div className='flex justify-between'>
                              <p>دانلود فایل ضمیمه</p>
                              <p className='text-sm '>دانلود</p>
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
              ذخیره تغییرات
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
