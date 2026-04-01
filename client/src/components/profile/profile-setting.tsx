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
import { useAuthContext } from '@/context/auth-provider'
import { useEffect, useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfileMutationFn } from '@/lib/api/profile'
import { toast } from '@/hooks/use-toast'
import { Loader, Upload, User, Camera } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { Link } from 'react-router-dom'

const formSchema = z.object({
  name: z.string().trim().min(1, { message: 'نام الزامی است' }),
  email: z.string().email({ message: 'ایمیل معتبر نیست' }),
  phone: z.string().regex(/^09\d{9}$/, { message: 'شماره تلفن معتبر نیست' }),
  username: z
    .string()
    .trim()
    .min(3, { message: 'نام کاربری باید حداقل ۳ حرف باشد' }),
  bio: z
    .string()
    .max(500, { message: 'بیوگرافی نباید بیشتر از ۵۰۰ کاراکتر باشد' })
    .optional(),
  jobTitle: z
    .string()
    .max(100, { message: 'عنوان شغلی نباید بیشتر از ۱۰۰ کاراکتر باشد' })
    .optional(),
  profilePicture: z.instanceof(File).optional(),
})

type FormValues = z.infer<typeof formSchema> & {
  profilePicture?: File | string
}

const ProfileSetting = () => {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const workspaceId = useWorkspaceId()
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: updateProfileMutationFn,
  })
  console.log(user)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      username: '',
      bio: '',
      jobTitle: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.setValue('name', user.name)
      form.setValue('email', user.email)
      form.setValue('phone', user.phone || '')
      form.setValue('username', user.username || '')
      form.setValue('bio', user.bio || '')
      form.setValue('jobTitle', user.jobTitle || '')
      if (user.profilePicture) {
        setPreviewImage(user.profilePicture)
      }
    }
  }, [form, user])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطا',
        description: 'لطفاً فقط فایل تصویری انتخاب کنید',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'خطا',
        description: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const onSubmit = (values: FormValues) => {
    const formData = new FormData()

    formData.append('name', values.name)
    formData.append('email', values.email)
    formData.append('username', values.username)
    formData.append('phone', values.phone)
    formData.append('bio', values.bio || '')
    formData.append('jobTitle', values.jobTitle || '')

    if (selectedFile) {
      formData.append('profilePicture', selectedFile)
    } else if (user?.profilePicture && !previewImage) {
      formData.append('profilePicture', '')
    }

    updateProfile(formData as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['authUser'],
        })
        setSelectedFile(null)
        toast({
          title: 'پروفایل با موفقیت به‌روزرسانی شد',
          variant: 'success',
        })
      },
      onError: (error) => {
        toast({
          title: 'خطا',
          description: error.message || 'خطا در به‌روزرسانی پروفایل',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div className='w-full' dir='rtl'>
      <div className='flex flex-col items-start justify-between py-0'>
        <div className='flex-1 mb-6 w-full'>
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* بخش تصویر پروفایل */}
            <div className='lg:w-1/3 flex flex-col items-center'>
              <div className='relative group mb-4'>
                <div className='w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg'>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt='تصویر پروفایل'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center'>
                      <User className='h-20 w-20 text-gray-400 dark:text-gray-600' />
                    </div>
                  )}

                  <div
                    className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center cursor-pointer'
                    onClick={triggerFileInput}
                  >
                    <Camera className='h-8 w-8 text-white' />
                  </div>
                </div>
              </div>

              <input
                type='file'
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept='image/*'
                className='hidden'
              />

              <div className='flex flex-col gap-3 w-full max-w-xs'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={triggerFileInput}
                  className='flex items-center justify-center gap-2 w-full'
                >
                  <Upload className='h-4 w-4' />
                  تغییر تصویر پروفایل
                </Button>
              </div>

              <p className='text-xs text-gray-500 dark:text-gray-400 mt-3 text-center'>
                فرمت‌های مجاز: JPG, PNG, GIF
                <br />
                حداکثر حجم: ۵ مگابایت
              </p>
            </div>

            {/* بخش فرم اطلاعات */}
            <div className='lg:w-2/3'>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                            نام و نام خانوادگی
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                              placeholder='نام و نام خانوادگی'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs mt-1' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='username'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                            نام کاربری
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                              placeholder='نام کاربری منحصر به فرد'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs mt-1' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                            ایمیل
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled
                              type='email'
                              className='h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                              placeholder='example@domain.com'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs mt-1' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                            شماره تلفن
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                              placeholder='09123456789'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs mt-1' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='jobTitle'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                            عنوان شغلی
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                              placeholder='عنوان شغلی شما'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs mt-1' />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>
                          بیوگرافی
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className='min-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 resize-none'
                            placeholder='درباره خودتان بنویسید...'
                            {...field}
                          />
                        </FormControl>
                        <div className='flex justify-between items-center'>
                          <FormMessage className='text-red-500 text-xs mt-1' />
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            {field.value?.length || 0}/500
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className='flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t dark:border-gray-800'>
                    <Link
                      to={`/workspace/${workspaceId}/profile/${user?.username || ''}`}
                      className='w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition'
                    >
                      مشاهده پروفایل
                    </Link>

                    <Button
                      type='submit'
                      disabled={isUpdating}
                      className='w-full sm:w-auto flex items-center justify-center'
                    >
                      {isUpdating ? (
                        <>
                          <Loader className='h-5 w-5 animate-spin ml-2' />
                          در حال ذخیره‌سازی...
                        </>
                      ) : (
                        'ذخیره تغییرات'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetting
