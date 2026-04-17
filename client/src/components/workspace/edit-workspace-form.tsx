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
import { Textarea } from '../ui/textarea'
import { useAuthContext } from '@/context/auth-provider'
import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editWorkspaceMutationFn } from '@/lib/api/api'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { toast } from '@/hooks/use-toast'
import { Loader } from 'lucide-react'
import { Permissions } from '@/constant'
import { useTranslation } from 'react-i18next'

export default function EditWorkspaceForm() {
  const { t } = useTranslation()

  const { workspace, hasPermission } = useAuthContext()
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE)

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate, isPending } = useMutation({
    mutationFn: editWorkspaceMutationFn,
  })

  const formSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t('workspaces.editWorkspace.validation.nameRequired'),
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

  useEffect(() => {
    if (workspace) {
      form.setValue('name', workspace.name)
      form.setValue('description', workspace?.description || '')
    }
  }, [form, workspace])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return

    const payload = {
      workspaceId: workspaceId,
      data: { ...values },
    }

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['workspace'],
        })

        queryClient.invalidateQueries({
          queryKey: ['userWorkspaces'],
        })
        toast({
          title: t('workspaces.editWorkspace.toast.successTitle'),
          description: t('workspaces.editWorkspace.toast.successDescription'),
          variant: 'success',
        })
      },
      onError: () => {
        toast({
          title: t('workspaces.editWorkspace.toast.errorTitle'),
          description: t('workspaces.editWorkspace.toast.errorDescription'),
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className='w-full h-auto max-w-full' dir='rtl'>
      <div className='h-full'>
        <div className='mb-5 border-b'>
          <h1 className='text-[17px] tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5 text-center sm:text-right'>
            {t('workspaces.editWorkspace.title')}
          </h1>
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
                      {t('workspaces.editWorkspace.nameLabel')}
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder={t(
                          'workspaces.editWorkspace.namePlaceholder'
                        )}
                        className='!h-[48px] disabled:opacity-90 disabled:pointer-events-none'
                        disabled={!canEditWorkspace}
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
                      {t('workspaces.editWorkspace.descriptionLabel')}
                      <span className='text-xs font-extralight mr-2'>
                        ({t('workspaces.editWorkspace.optional')})
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        rows={6}
                        disabled={!canEditWorkspace}
                        className='disabled:opacity-90 disabled:pointer-events-none'
                        placeholder={t(
                          'workspaces.editWorkspace.descriptionPlaceholder'
                        )}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {canEditWorkspace && (
              <Button
                className='flex place-self-end h-[40px] text-white font-semibold'
                disabled={isPending}
                type='submit'
              >
                {isPending && <Loader className='animate-spin ml-2' />}
                {t('workspaces.editWorkspace.submit')}
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
