import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '../ui/textarea'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWorkspaceMutationFn } from '@/lib/api/api'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void
}) {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
  })

  const formSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t('workspaces.createWorkspace.validation.nameRequired'),
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return

    mutate(values, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ['userWorkspaces'],
        })

        const workspace = data.data?.workspace

        toast({
          title: t('workspaces.createWorkspace.toast.successTitle'),
          description: t('workspaces.createWorkspace.toast.successDescription'),
          variant: 'success',
        })
        onClose()
        navigate(`/workspace/${workspace?._id}`)
      },
      onError: () => {
        toast({
          title: t('workspaces.createWorkspace.toast.errorTitle'),
          description: t('workspaces.createWorkspace.toast.errorDescription'),
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <main
      className='w-full flex flex-row min-h-[590px] h-auto max-w-full'
      dir='rtl'
    >
      <div className='h-full px-10 py-10 flex-1'>
        <div className='mb-5 flex flex-col gap-2'>
          <h1 className='text-2xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5 text-center sm:text-right'>
            {t('workspaces.createWorkspace.title')}
          </h1>

          <p className='text-muted-foreground text-center sm:text-right leading-6'>
            {t('workspaces.createWorkspace.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='mb-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                      {t('workspaces.createWorkspace.nameLabel')}
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder={t(
                          'workspaces.createWorkspace.namePlaceholder'
                        )}
                        className='!h-[48px]'
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      {t('workspaces.createWorkspace.nameDescription')}
                    </FormDescription>

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
                      {t('workspaces.createWorkspace.descriptionLabel')}
                      <span className='text-xs font-extralight mr-2'>
                        ({t('workspaces.createWorkspace.optional')})
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder={t(
                          'workspaces.createWorkspace.descriptionPlaceholder'
                        )}
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      {t('workspaces.createWorkspace.descriptionHelp')}
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className='w-full h-[40px] text-white font-semibold'
              type='submit'
            >
              {isPending && <Loader className='animate-spin ml-2' />}
              {t('workspaces.createWorkspace.submit')}
            </Button>
          </form>
        </Form>
      </div>

      <div
        className="relative flex-1 shrink-0 hidden bg-muted md:block
        bg-[url('/images/workspace.jpg')] bg-cover bg-center h-full"
      />
    </main>
  )
}
