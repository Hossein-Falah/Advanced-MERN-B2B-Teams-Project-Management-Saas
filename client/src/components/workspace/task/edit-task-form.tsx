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
import { Calendar } from '@/components/ui/calendar'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant'
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members'
import { editTaskMutationFn } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { TaskType } from '@/types/api.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'

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

  // گزینه‌های اعضا
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

  // برچسب‌های فارسی برای وضعیت‌ها
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

  // گزینه‌های وضعیت با برچسب فارسی
  const statusOptions = Object.values(TaskStatusEnum).map((status) => ({
    label: statusLabels[status] || status,
    value: status,
  }))

  // گزینه‌های اولویت با برچسب فارسی
  const priorityOptions = Object.values(TaskPriorityEnum).map((priority) => ({
    label: priorityLabels[priority] || priority,
    value: priority,
  }))

  const formSchema = z.object({
    title: z.string().trim().min(1, { message: 'عنوان تسک الزامی است' }),
    description: z.string().trim(),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum]
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum]
    ),
    assignedTo: z
      .string()
      .trim()
      .min(1, { message: 'انتخاب مسئول الزامی است' }),
    dueDate: z.date({ required_error: 'تاریخ سررسید الزامی است' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      assignedTo: task.assignedTo?._id ?? '',
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return

    const payload = {
      workspaceId,
      projectId: task.project?._id ?? '',
      taskId: task._id,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    }

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-tasks', workspaceId] })
        toast({
          title: 'موفق',
          description: 'تسک با موفقیت به‌روزرسانی شد',
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
          <h1 className='text-xl font-semibold text-center sm:text-right'>
            ویرایش تسک
          </h1>
        </div>
        <Form {...form}>
          <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
            {/* عنوان */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان تسک</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='عنوان تسک' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* توضیحات */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات تسک</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder='توضیحات' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* مسئول */}
            <FormField
              control={form.control}
              name='assignedTo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مسئول</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='یک مسئول انتخاب کنید' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className='w-full max-h-[200px] overflow-y-auto scrollbar'>
                        {membersOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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

            {/* تاریخ سررسید */}
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
                          variant='outline'
                          className='w-full justify-start text-right'
                        >
                          {field.value
                            ? formatJalali(field.value, 'PPP', { locale: faIR })
                            : 'انتخاب تاریخ'}
                          <CalendarIcon className='mr-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={faIR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* وضعیت */}
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وضعیت</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='انتخاب وضعیت' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* اولویت */}
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اولویت</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='انتخاب اولویت' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending && <Loader className='animate-spin ml-2' />}
              ذخیره تغییرات
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
