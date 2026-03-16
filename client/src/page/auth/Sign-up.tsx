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
import { registerMutationFn } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { Loader } from 'lucide-react'

const SignUp = () => {
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  })
  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: 'Name is required',
    }),
    email: z.string().trim().email('Invalid email address').min(1, {
      message: 'Workspace name is required',
    }),
    password: z.string().trim().min(1, {
      message: 'Password is required',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return
    mutate(values, {
      onSuccess: () => {
        navigate('/')
      },
      onError: (error) => {
        console.log(error)
        toast({
          title: 'Error',
          description: error.message,
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
          TeleMe
        </Link>
        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>ساخت حساب کاربری</CardTitle>
              <CardDescription>
                با ایمیل یا شماره تماس وارد شوید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className='grid gap-6'>
                    <div className='flex flex-col gap-4'>
                      <GoogleOauthButton label='Signup' />
                    </div>
                    <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                      <span className='relative z-10 bg-background px-2 text-muted-foreground'>
                        یا ورود با
                      </span>
                    </div>
                    <div className='grid gap-2'>
                      <div className='grid gap-2'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                                نام
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Joh Doe'
                                  className='!h-[48px]'
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <FormField
                          control={form.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                                ایمیل
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='m@example.com'
                                  className='!h-[48px]'
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='grid gap-2'>
                        <FormField
                          control={form.control}
                          name='password'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='dark:text-[#f1f7feb5] text-sm'>
                                رمز عبور
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
                        Sign up
                      </Button>
                    </div>
                    <div className='text-center text-sm'>
                      آیا حسابی از قبل دارید؟
                      <Link
                        to='/'
                        className='underline underline-offset-4 mr-2'
                      >
                        ورود
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  '>
            با ثبت نام و ورود با تمامی قوانین ما موافقت میکنید
            <a href='#'> قوانین و سیاست ها </a> و <a href='#'>خطمشی رازداری </a>
            .
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
