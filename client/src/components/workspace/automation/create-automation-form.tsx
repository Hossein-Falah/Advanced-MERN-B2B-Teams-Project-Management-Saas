import { z } from 'zod'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CalendarIcon, Loader } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Calendar } from '@/components/ui/calendar'

import useWorkspaceId from '@/hooks/use-workspace-id'
import { getAllTasksQueryFn } from '@/lib/api/api'
import { AutomationType } from '@/types/automation.type'
import { createAutomationMutationFn } from '@/lib/api/automation'
import { toast } from '@/hooks/use-toast'

const daysOfWeekOptions = [
  { label: 'شنبه', value: 0 },
  { label: 'یکشنبه', value: 1 },
  { label: 'دوشنبه', value: 2 },
  { label: 'سه‌شنبه', value: 3 },
  { label: 'چهارشنبه', value: 4 },
  { label: 'پنجشنبه', value: 5 },
  { label: 'جمعه', value: 6 },
]

const automationTypeLabels: Record<AutomationType, string> = {
  TASK_REPETITION: 'تکرار وظیفه',
  SCHEDULED: 'زمان‌بندی شده',
  TRIGGER_BASED: 'مبتنی بر رویداد',
}

const formSchema = z.object({
  type: z.nativeEnum(AutomationType),
  taskId: z.string().min(1),
  daysOfWeek: z.array(z.number()).min(1),
  startDate: z.date(),
  hour: z.string(),
  minute: z.string(),
  timezone: z.string().default('Asia/Tehran'),
  active: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateAutomationForm({
  onClose,
}: {
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword] = useDebounce(keyword, 500)

  const { mutate, isPending } = useMutation({
    mutationFn: createAutomationMutationFn,
  })

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks-search', workspaceId, debouncedKeyword],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: debouncedKeyword,
        pageSize: 10,
        pageNumber: 1,
      }),
    enabled: !!workspaceId,
  })

  const tasks = tasksData?.tasks || []

  const taskOptions = tasks.map((task: any) => ({
    value: task._id,
    label: task.title,
  }))

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: AutomationType.TASK_REPETITION,
      timezone: 'Asia/Tehran',
      daysOfWeek: [],
      startDate: new Date(),
      hour: '9',
      minute: '0',
      active: true,
    },
  })

  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5)

  const onSubmit = (values: FormValues) => {
    if (isPending) return

    const hh = String(Number(values.hour)).padStart(2, '0')
    const mm = String(Number(values.minute)).padStart(2, '0')

    mutate(
      {
        workspaceId,
        data: {
          type: values.type,
          taskId: values.taskId,
          daysOfWeek: values.daysOfWeek,
          timeOfDay: `${hh}:${mm}`,
          timezone: values.timezone,
          active: values.active,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['automations', workspaceId],
          })

          toast({
            title: 'موفق',
            description: 'اتوماسیون ایجاد شد',
            variant: 'success',
          })

          onClose()
        },
      },
    )
  }

  return (
    <div className='w-full' dir='rtl'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* automation type */}
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع اتوماسیون</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='انتخاب کنید' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(AutomationType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {automationTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* task select with search */}
          <FormField
            control={form.control}
            name='taskId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>وظیفه</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='انتخاب وظیفه' />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <div className='p-2'>
                      <Input
                        placeholder='جستجوی وظیفه...'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>

                    {isTasksLoading && (
                      <div className='flex justify-center py-3'>
                        <Loader className='w-4 h-4 animate-spin' />
                      </div>
                    )}

                    <div className='max-h-[200px] overflow-y-auto'>
                      {taskOptions.map((task) => (
                        <SelectItem key={task.value} value={task.value}>
                          {task.label}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* days */}
          <FormField
            control={form.control}
            name='daysOfWeek'
            render={({ field }) => (
              <FormItem>
                <FormLabel>روزهای اجرا</FormLabel>
                <div className='flex flex-wrap gap-2'>
                  {daysOfWeekOptions.map((day) => {
                    const selected = field.value?.includes(day.value)

                    return (
                      <Button
                        key={day.value}
                        type='button'
                        variant={selected ? 'default' : 'outline'}
                        className='h-8 text-xs'
                        onClick={() => {
                          if (selected) {
                            field.onChange(
                              field.value.filter((d) => d !== day.value),
                            )
                          } else {
                            field.onChange([...(field.value || []), day.value])
                          }
                        }}
                      >
                        {day.label}
                      </Button>
                    )
                  })}
                </div>
              </FormItem>
            )}
          />

          {/* date */}
          <FormField
            control={form.control}
            name='startDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاریخ شروع</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full'>
                      {formatJalali(field.value, 'PPP', { locale: faIR })}
                      <CalendarIcon className='mr-auto h-4 w-4' />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      locale={faIR}
                      onSelect={(d) => d && field.onChange(d)}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          {/* time */}
          <div className='flex gap-2'>
            <FormField
              control={form.control}
              name='hour'
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='ساعت' />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <FormField
              control={form.control}
              name='minute'
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='دقیقه' />
                  </SelectTrigger>
                  <SelectContent>
                    {minuteOptions.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {String(m).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type='submit' disabled={isPending}>
            {isPending && <Loader className='animate-spin ml-2' />}
            ایجاد اتوماسیون
          </Button>
        </form>
      </Form>
    </div>
  )
}
