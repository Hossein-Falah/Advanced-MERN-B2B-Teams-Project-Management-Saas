import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

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

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import useWorkspaceId from '@/hooks/use-workspace-id'
import { getAllTasksQueryFn } from '@/lib/api/api'
import { AutomationType } from '@/types/automation.type'
import { createAutomationMutationFn } from '@/lib/api/automation'
import { toast } from '@/hooks/use-toast'

/**
 * کامپوننت reusable برای انتخاب فقط ساعت + دقیقه
 */
type TimeFieldProps = {
  label: string
  value?: string // "HH:MM"
  onChange: (val: string) => void
}

function TimeField({ label, value, onChange }: TimeFieldProps) {
  const [hourStr, minuteStr] = (value || '00:00').split(':')

  const hour = Number(hourStr) || 0
  const minute = Number(minuteStr) || 0

  const updateTime = (h: number, m: number) => {
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    onChange(`${hh}:${mm}`)
  }

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>

      <div className='flex gap-2'>
        {/* ساعت */}
        <div className='flex flex-col gap-1'>
          <p className='text-xs'>ساعت :</p>

          <Select
            value={String(hour)}
            onValueChange={(h) => {
              updateTime(Number(h), minute)
            }}
          >
            <SelectTrigger className='w-[90px]'>
              <SelectValue placeholder='ساعت' />
            </SelectTrigger>

            <SelectContent className='max-h-[200px]'>
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {String(h).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* دقیقه */}
        <div className='flex flex-col gap-1'>
          <p className='text-xs'>دقیقه :</p>

          <Select
            value={String(minute)}
            onValueChange={(m) => {
              updateTime(hour, Number(m))
            }}
          >
            <SelectTrigger className='w-[90px]'>
              <SelectValue placeholder='دقیقه' />
            </SelectTrigger>

            <SelectContent className='max-h-[200px]'>
              {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {String(m).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormMessage />
    </FormItem>
  )
}

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

/**
 * به جای startDateTime اینجا timeOfDay داریم
 */
const formSchema = z.object({
  type: z.nativeEnum(AutomationType),
  taskId: z.string().min(1, { message: 'انتخاب وظیفه الزامی است' }),
  daysOfWeek: z
    .array(z.number())
    .min(1, { message: 'حداقل یک روز را انتخاب کنید' }),
  timeOfDay: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: 'ساعت نامعتبر است (فرمت  HH:MM)' }),
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
      timeOfDay: '09:00',
      active: true,
    },
  })

  const onSubmit = (values: FormValues) => {
    if (isPending) return

    mutate(
      {
        workspaceId,
        data: {
          type: values.type,
          taskId: values.taskId,
          daysOfWeek: values.daysOfWeek,
          timeOfDay: values.timeOfDay, // مستقیماً همون رشته "HH:MM"
          timezone: values.timezone,
          active: values.active,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['all-automations', workspaceId],
          })

          toast({
            title: 'موفق',
            description: 'اتوماسیون ایجاد شد',
            variant: 'success',
          })

          onClose()
        },
        onError: (error: any) => {
          toast({
            title: 'خطا',
            description: error?.message || 'خطایی رخ داد',
            variant: 'destructive',
          })
        },
      },
    )
  }

  return (
    <div className='w-full' dir='rtl'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* نوع اتوماسیون */}
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع اتوماسیون</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                <FormMessage />
              </FormItem>
            )}
          />

          {/* انتخاب وظیفه + سرچ */}
          <FormField
            control={form.control}
            name='taskId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>وظیفه</FormLabel>

                <Select onValueChange={field.onChange} value={field.value}>
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
                <FormMessage />
              </FormItem>
            )}
          />

          {/* روزهای اجرا */}
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
                              field.value.filter(
                                (d: number) => d !== day.value,
                              ),
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
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ساعت اجرا (بدون تاریخ) */}
          <FormField
            control={form.control}
            name='timeOfDay'
            render={({ field }) => (
              <TimeField
                label='ساعت اجرا'
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Button type='submit' disabled={isPending}>
            {isPending && <Loader className='animate-spin ml-2' />}
            ایجاد اتوماسیون
          </Button>
        </form>
      </Form>
    </div>
  )
}
