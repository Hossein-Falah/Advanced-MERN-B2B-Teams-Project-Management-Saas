import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useTranslation } from 'react-i18next'

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
import { AutomationItem, AutomationType } from '@/types/automation.type'
import { updateAutomationMutationFn } from '@/lib/api/automation'
import { toast } from '@/hooks/use-toast'
import { TimeField } from '@/components/ui/time-field'
import { ALL_DAYS } from '@/constant'

const formSchema = (t: (key: string) => string) =>
  z.object({
    type: z.nativeEnum(AutomationType),
    taskId: z
      .string()
      .min(1, { message: t('automations.validation.taskRequired') }),
    daysOfWeek: z
      .array(z.number())
      .min(1, { message: t('automations.validation.daysRequired') }),
    timeOfDay: z.string().regex(/^\d{2}:\d{2}$/, {
      message: t('automations.validation.invalidTime'),
    }),
    timezone: z.string().default('Asia/Tehran'),
    active: z.boolean().default(true),
  })

type FormValues = z.infer<ReturnType<typeof formSchema>>

export default function EditAutomationForm({
  automation,
  onClose,
}: {
  automation: AutomationItem
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()
  const { t } = useTranslation()

  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword] = useDebounce(keyword, 500)

  const { mutate, isPending } = useMutation({
    mutationFn: updateAutomationMutationFn,
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

  const tasks = tasksData?.data?.tasks || []

  const taskOptions = tasks.map((task: any) => ({
    value: task._id,
    label: task.title,
  }))

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      type: automation?.type ?? AutomationType.TASK_REPETITION,
      taskId: automation.taskId?._id,
      daysOfWeek: automation?.daysOfWeek ?? [],
      timeOfDay: automation?.timeOfDay || '09:00',
      timezone: automation?.timezone || 'Asia/Tehran',
      active: automation?.active ?? true,
    },
  })

  const onSubmit = (values: FormValues) => {
    if (isPending) return

    mutate(
      {
        workspaceId,
        automationId: automation._id,
        data: {
          type: values.type,
          taskId: values.taskId,
          daysOfWeek: values.daysOfWeek,
          timeOfDay: values.timeOfDay,
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
            title: t('automations.toast.updateSuccess.title'),
            description: t('automations.toast.updateSuccess.description'),
            variant: 'success',
          })

          onClose()
        },
        onError: (error: any) => {
          console.error('Update automation error', error)

          toast({
            title: t('automations.toast.updateError.title'),
            description:
              error?.message || t('automations.toast.updateError.description'),
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
            {t('automations.form.edit.title')}
          </p>
        </div>

        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            {/* نوع اتوماسیون */}
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('automations.form.type.label')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('automations.form.type.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AutomationType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`automations.types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* وظیفه + سرچ */}
            <FormField
              control={form.control}
              name='taskId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('automations.form.task.label')}</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('automations.form.task.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <div className='p-2'>
                        <Input
                          placeholder={t(
                            'automations.form.task.searchPlaceholder'
                          )}
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
                  <FormLabel>
                    {t('automations.form.daysOfWeek.label')}
                  </FormLabel>
                  <div className='flex flex-wrap gap-2'>
                    {ALL_DAYS.map((day) => {
                      const selected = field.value?.includes(day.value)

                      return (
                        <Button
                          key={day.value}
                          type='button'
                          variant={selected ? 'default' : 'outline'}
                          className='h-8 text-xs'
                          onClick={() => {
                            const current = field.value || []
                            if (selected) {
                              field.onChange(
                                current.filter((d: number) => d !== day.value)
                              )
                            } else {
                              field.onChange([...current, day.value])
                            }
                          }}
                        >
                          {t(`days.${day.value}`)}
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
                  labelKey={t('automations.form.timeOfDay.label')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* وضعیت فعال / غیرفعال */}
            <FormField
              control={form.control}
              name='active'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('automations.form.active.label')}</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('automations.form.active.placeholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='true'>
                        {t('automations.status.active')}
                      </SelectItem>
                      <SelectItem value='false'>
                        {t('automations.status.inactive')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className='flex place-self-start h-[40px] text-white font-semibold'
              type='submit'
              disabled={isPending}
            >
              {isPending && <Loader className='animate-spin ml-2' />}
              {t('automations.form.edit.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
