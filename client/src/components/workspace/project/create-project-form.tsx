import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '../../ui/textarea'
import EmojiPickerComponent from '@/components/emoji-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProjectMutationFn } from '@/lib/api/api'
import { toast } from '@/hooks/use-toast'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CreateProjectForm({
  onClose,
}: {
  onClose: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const [emoji, setEmoji] = useState('📊')

  const { mutate, isPending } = useMutation({
    mutationFn: createProjectMutationFn,
  })

  const formSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t('projects.createProject.validation.nameRequired'),
      }),
    description: z.string().trim(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji)
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return
    const payload = {
      workspaceId,
      data: {
        emoji,
        ...values,
      },
    }
    mutate(payload, {
      onSuccess: (data) => {
        const project = data.data?.project
        queryClient.invalidateQueries({
          queryKey: ['allprojects', workspaceId],
        })

        toast({
          title: t('projects.createProject.toast.successTitle'),
          description: t('projects.createProject.toast.successDescription'),
          variant: 'success',
        })

        navigate(`/workspace/${workspaceId}/project/${project?._id}`)
        setTimeout(() => onClose(), 500)
      },
      onError: (err) => {
        // اینجا هیچ پیغام خام از API نمایش داده نمی‌شود
        if (err.message == 'UNAUTHORIZED') {
          toast({
            title: t('projects.createProject.toast.errorTitle'),
            description: t('errors.UNAUTHORIZED'),
            variant: 'destructive',
          })
        } else {
          toast({
            title: t('projects.createProject.toast.errorTitle'),
            description: t('projects.createProject.toast.errorDescription'),
            variant: 'destructive',
          })
        }
      },
    })
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <div className='h-full'>
        <div className='my-5 pb-2 border-b'>
          <h1
            className='text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1
           text-center sm:text-right'
          >
            {t('projects.createProject.title')}
          </h1>
          <p className='text-muted-foreground text-sm leading-tight text-center sm:text-right'>
            {t('projects.createProject.subtitle')}
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                {t('projects.createProject.emojiLabel')}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='font-normal size-[60px] !p-2 !shadow-none mt-2 items-center rounded-full'
                  >
                    <span className='text-4xl'>{emoji}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='start' className='!p-0'>
                  <EmojiPickerComponent onSelectEmoji={handleEmojiSelection} />
                </PopoverContent>
              </Popover>
            </div>
            <div className='mb-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                      {t('projects.createProject.nameLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'projects.createProject.namePlaceholder'
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
            <div className='mb-4'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                      {t('projects.createProject.descriptionLabel')}{' '}
                      <span className='text-xs font-extralight mr-2'>
                        ({t('projects.createProject.optional')})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={t(
                          'projects.createProject.descriptionPlaceholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className='flex place-self-end h-[40px] text-white font-semibold'
              type='submit'
            >
              {isPending && <Loader className='animate-spin' />}
              {t('projects.createProject.submit')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
