import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import Logo from '@/components/logo'
import GoogleOauthButton from '@/components/auth/google-oauth-button'
import { useMutation } from '@tanstack/react-query'
import { registerMutationFn } from '@/lib/api/api'
import { toast } from '@/hooks/use-toast'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SignUp = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  })

  // 1) اضافه کردن phone به اسکیمای فرم
  const formSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, {
        message: t('auth.validation.nameRequired'),
      }),
    email: z
      .string()
      .trim()
      .email(t('auth.validation.emailInvalid'))
      .min(1, {
        message: t('auth.validation.emailRequired'),
      }),
    phone: z
      .string()
      .trim()
      .min(1, {
        message: t('auth.validation.phoneRequired'),
      }),
    password: z
      .string()
      .trim()
      .min(1, {
        message: t('auth.validation.passwordRequired'),
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '', // 2) مقدار پیش‌فرض phone
      password: '',
    },
  })

  const mapErrorToMessage = (error: any): string => {
    const status = error?.response?.status || error?.statusCode || error?.status
    const code = error?.response?.data?.code || error?.code

    if (status === 401 || code === 'UNAUTHORIZED') {
      return t('auth.errors.UNAUTHORIZED')
    }

    if (status === 403 || code === 'FORBIDDEN') {
      return t('auth.errors.forbidden')
    }

    if (status === 404 || code === 'NOT_FOUND') {
      return t('auth.errors.notFound')
    }

    if (status >= 500) {
      return t('auth.errors.server')
    }

    if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
      return t('auth.errors.network')
    }

    return t('auth.errors.unknown')
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return

    // اینجا phone هم داخل values خواهد بود
    mutate(values, {
      onSuccess: () => {
        navigate('/')
      },
      onError: (error: any) => {
        const message = mapErrorToMessage(error)

        toast({
          title: t('auth.errors.title'),
          description: message,
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          to='/'
          className='flex items-center gap-2 self-center font-medium'
        >
          <Logo />
          {t('common.appName')}
        </Link>

        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>
                {t('auth.signup.title')}
              </CardTitle>
              <CardDescription>{t('auth.signup.description')}</CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='grid gap-6'>
                    <div className='flex flex-col gap-4'>
                      <GoogleOauthButton
                        label={t('auth.signup.googleSignup')}
                      />
                    </div>

                    <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                      <span className='relative z-10 bg-background px-2 text-muted-foreground'>
                        {t('auth.signup.orSignupWith')}
                      </span>
                    </div>

                    {/* name */}
                    <div className='grid gap-2'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                              {t('auth.signup.nameLabel')}
                            </FormLabel>

                            <FormControl>
                              <Input
                                placeholder={t('auth.signup.namePlaceholder')}
                                className='!h-[48px]'
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* email */}
                    <div className='grid gap-2'>
                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                              {t('auth.signup.emailLabel')}
                            </FormLabel>

                            <FormControl>
                              <Input
                                placeholder={t('auth.signup.emailPlaceholder')}
                                className='!h-[48px]'
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 3) phone field */}
                    <div className='grid gap-2'>
                      <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                              {t('auth.signup.phoneLabel')}
                            </FormLabel>

                            <FormControl>
                              <Input
                                placeholder={t('auth.signup.phonePlaceholder')}
                                className='!h-[48px]'
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* password */}
                    <div className='grid gap-2'>
                      <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                              {t('auth.signup.passwordLabel')}
                            </FormLabel>

                            <FormControl>
                              <Input
                                type='password'
                                className='!h-[48px]'
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type='submit'
                      disabled={isPending}
                      className='w-full'
                    >
                      {isPending && <Loader className='animate-spin' />}
                      {t('auth.signup.submit')}
                    </Button>

                    <div className='text-center text-sm'>
                      {t('auth.signup.haveAccount')}

                      <Link
                        to='/'
                        className='underline underline-offset-4 mr-2'
                      >
                        {t('auth.signup.login')}
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary'>
            {t('auth.termsText')}
            <a href='#'> {t('auth.termsLink')} </a>
            {' و '}
            <a href='#'>{t('auth.privacyLink')}</a>.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
