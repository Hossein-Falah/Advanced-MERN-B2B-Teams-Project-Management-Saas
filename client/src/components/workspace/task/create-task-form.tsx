import { z } from 'zod'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '../../ui/textarea'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant'
import useGetProjectsInWorkspaceQuery from '@/hooks/api/use-get-projects'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createTaskMutationFn } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export default function CreateTaskForm(props: {
  projectId?: string
  onClose: () => void
}) {
  const { projectId, onClose } = props

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

  const projects = data?.projects || []
  const members = memberData?.members || []

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

  const formSchema = z.object({
    title: z.string().trim().min(1, {
      message: 'عنوان تسک الزامی است',
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
      message: 'انتخاب پروژه الزامی است',
    }),
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
    dueDate: z.date({
      required_error: 'تاریخ سررسید الزامی است',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: projectId ? projectId : '',
    },
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

  // ساخت گزینه‌های وضعیت با برچسب فارسی
  const statusOptions = taskStatusList.map((status) => ({
    value: status,
    label: statusLabels[status] || status,
  }))

  // ساخت گزینه‌های اولویت با برچسب فارسی
  const priorityOptions = taskPriorityList.map((priority) => ({
    value: priority,
    label: priorityLabels[priority] || priority,
  }))

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return
    const payload = {
      workspaceId,
      projectId: values.projectId,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    }

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['project-analytics', projectId],
        })

        queryClient.invalidateQueries({
          queryKey: ['all-tasks', workspaceId],
        })

        toast({
          title: 'موفق',
          description: 'تسک با موفقیت ایجاد شد',
          variant: 'success',
        })
        onClose()
      },
      onError: (error) => {
        toast({
          title: 'خطا',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <div className='h-full'>
        <div className='my-5 pb-2 border-b'>
          <p className='text-muted-foreground text-sm leading-tight text-center sm:text-right'>
            سازماندهی و مدیریت تسک‌ها، منابع و همکاری تیمی
          </p>
        </div>
        <Form {...form}>
          <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                      عنوان تسک
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
                      توضیحات تسک
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

            {/* پروژه */}
            {!projectId && (
              <div>
                <FormField
                  control={form.control}
                  name='projectId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>پروژه</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='یک پروژه انتخاب کنید' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoading && (
                            <div className='my-2'>
                              <Loader className='w-4 h-4 place-self-center flex animate-spin' />
                            </div>
                          )}
                          <div
                            className='w-full max-h-[200px]
                           overflow-y-auto scrollbar'
                          >
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
                    <FormLabel>مسئول</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='یک مسئول انتخاب کنید' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div
                          className='w-full max-h-[200px]
                           overflow-y-auto scrollbar'
                        >
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

            {/* تاریخ سررسید */}
            <div className='!mt-2'>
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ سررسید</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full flex-1 pl-3 text-right font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              formatJalali(field.value, 'PPP', { locale: faIR })
                            ) : (
                              <span>انتخاب تاریخ</span>
                            )}
                            <CalendarIcon className='mr-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            date > new Date('2100-12-31')
                          }
                          initialFocus
                          defaultMonth={new Date()}
                          fromMonth={new Date()}
                          locale={faIR} // اضافه کردن locale شمسی
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
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

            <Button
              className='flex place-self-start h-[40px] text-white font-semibold'
              type='submit'
              disabled={isPending}
            >
              {isPending && <Loader className='animate-spin ml-2' />}
              ایجاد
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
