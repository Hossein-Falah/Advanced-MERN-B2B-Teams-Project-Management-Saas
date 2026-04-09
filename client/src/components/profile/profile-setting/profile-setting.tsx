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
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfileMutationFn } from '@/lib/api/profile'
import { toast } from '@/hooks/use-toast'
import { Loader, Upload, User, Camera } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

// --------- Zod Schema ---------
const notifSchema = z.object({
  onCreateTask: z.boolean().optional().default(false),
  onUpdateTask: z.boolean().optional().default(false),
  onMention: z.boolean().optional().default(false),
  onAutomationAction: z.boolean().optional().default(false),
  onMessage: z.boolean().optional().default(false),
})

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
  profilePicture: z.instanceof(File).optional().or(z.string().optional()),

  region: z.string().optional(),
  workSchedule: z
    .object({
      workingDays: z.array(z.number()).optional(),
      startHour: z.number().min(0).max(23).optional(),
      endHour: z.number().min(0).max(23).optional(),
    })
    .optional(),
  notifConditions: notifSchema.optional(),
  smsConditions: notifSchema.optional(),
})

type FormValues = z.infer<typeof formSchema>

const ALL_DAYS = [
  { value: 0, label: 'شنبه' },
  { value: 1, label: 'یکشنبه' },
  { value: 2, label: 'دوشنبه' },
  { value: 3, label: 'سه‌شنبه' },
  { value: 4, label: 'چهارشنبه' },
  { value: 5, label: 'پنجشنبه' },
  { value: 6, label: 'جمعه' },
]

const NOTIF_ITEMS = [
  { key: 'onCreateTask' as const, label: 'ساخت تسک' },
  { key: 'onUpdateTask' as const, label: 'ویرایش تسک' },
  { key: 'onMention' as const, label: 'منشن' },
  { key: 'onAutomationAction' as const, label: 'اتومیشن' },
  { key: 'onMessage' as const, label: 'پیام' },
]

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function allTrue(obj: any, keys: string[]) {
  return keys.every((k) => !!obj?.[k])
}
function allFalse(obj: any, keys: string[]) {
  return keys.every((k) => !obj?.[k])
}

const ProfileSetting = () => {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'work' | 'notify'>(
    'profile',
  )
  const workspaceId = useWorkspaceId()

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: updateProfileMutationFn,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      username: '',
      bio: '',
      jobTitle: '',
      region: 'Asia/Tehran',
      workSchedule: { workingDays: [1, 2, 3, 4, 5], startHour: 9, endHour: 18 },
      notifConditions: {
        onCreateTask: true,
        onUpdateTask: true,
        onMention: true,
        onAutomationAction: true,
        onMessage: true,
      },
      smsConditions: {
        onCreateTask: false,
        onUpdateTask: false,
        onMention: false,
        onAutomationAction: false,
        onMessage: false,
      },
    },
  })

  useEffect(() => {
    if (!user) return
    form.setValue('name', user.name)
    form.setValue('email', user.email)
    form.setValue('phone', user.phone || '')
    form.setValue('username', user.username || '')
    form.setValue('bio', user.bio || '')
    form.setValue('jobTitle', user.jobTitle || '')

    form.setValue('region', user.region || 'Asia/Tehran')
    form.setValue('workSchedule', {
      workingDays: user.workSchedule?.workingDays?.length
        ? user.workSchedule.workingDays
        : [1, 2, 3, 4, 5],
      startHour: user.workSchedule?.startHour ?? 9,
      endHour: user.workSchedule?.endHour ?? 18,
    })
    form.setValue('notifConditions', {
      onCreateTask: user.notifConditions?.onCreateTask ?? true,
      onUpdateTask: user.notifConditions?.onUpdateTask ?? true,
      onMention: user.notifConditions?.onMention ?? true,
      onAutomationAction: user.notifConditions?.onAutomationAction ?? true,
      onMessage: user.notifConditions?.onMessage ?? true,
    })
    form.setValue('smsConditions', {
      onCreateTask: user.smsConditions?.onCreateTask ?? false,
      onUpdateTask: user.smsConditions?.onUpdateTask ?? false,
      onMention: user.smsConditions?.onMention ?? false,
      onAutomationAction: user.smsConditions?.onAutomationAction ?? false,
      onMessage: user.smsConditions?.onMessage ?? false,
    })

    if (user.profilePicture) setPreviewImage(user.profilePicture)
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
    reader.onloadend = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const onSubmit = (values: FormValues) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('email', values.email)
    formData.append('username', values.username)
    formData.append('phone', values.phone)
    formData.append('bio', values.bio || '')
    formData.append('jobTitle', values.jobTitle || '')

    if (values.region) formData.append('region', values.region)

    if (values.workSchedule) {
      formData.append(
        'workSchedule',
        JSON.stringify({
          workingDays: values.workSchedule.workingDays || [],
          startHour: values.workSchedule.startHour ?? 9,
          endHour: values.workSchedule.endHour ?? 18,
        }),
      )
    }

    if (values.notifConditions)
      formData.append('notifConditions', JSON.stringify(values.notifConditions))
    if (values.smsConditions)
      formData.append('smsConditions', JSON.stringify(values.smsConditions))

    if (selectedFile) formData.append('profilePicture', selectedFile)
    else if (user?.profilePicture && !previewImage)
      formData.append('profilePicture', '')

    updateProfile(formData as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['authUser'] })
        toast({ title: 'پروفایل با موفقیت به‌روزرسانی شد', variant: 'success' })
        setSelectedFile(null)
      },
      onError: (error: any) => {
        toast({
          title: 'خطا',
          description:
            error?.response?.data?.message ||
            error.message ||
            'خطا در به‌روزرسانی پروفایل',
          variant: 'destructive',
        })
      },
    })
  }

  const workSchedule = form.watch('workSchedule')
  const notifConditions = form.watch('notifConditions')
  const smsConditions = form.watch('smsConditions')

  const notifKeys = useMemo(() => NOTIF_ITEMS.map((i) => i.key as string), [])
  const notifAllOn = allTrue(notifConditions, notifKeys)
  const notifAllOff = allFalse(notifConditions, notifKeys)
  const smsAllOn = allTrue(smsConditions, notifKeys)
  const smsAllOff = allFalse(smsConditions, notifKeys)

  const StickyActions = () => (
    <>
      {/* دسکتاپ/تبلت */}
      <div className='hidden sm:flex items-center justify-end gap-3 pt-4 border-t'>
        <Link
          to={`/workspace/${workspaceId}/profile/${user?.username || ''}`}
          className='inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition'
        >
          مشاهده پروفایل
        </Link>

        <Button type='submit' disabled={isUpdating} className='min-w-36'>
          {isUpdating ? (
            <span className='inline-flex items-center gap-2'>
              <Loader className='h-4 w-4 animate-spin' />
              در حال ذخیره…
            </span>
          ) : (
            'ذخیره تغییرات'
          )}
        </Button>
      </div>

      {/* موبایل: اکشن چسبان پایین */}
      <div className='sm:hidden fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]'>
        <div className='flex gap-2'>
          <Link
            to={`/workspace/${workspaceId}/profile/${user?.username || ''}`}
            className='flex-1 inline-flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium'
          >
            پروفایل
          </Link>
          <Button
            type='submit'
            disabled={isUpdating}
            className='flex-[1.3] py-6'
          >
            {isUpdating ? (
              <span className='inline-flex items-center gap-2'>
                <Loader className='h-4 w-4 animate-spin' />
                ذخیره…
              </span>
            ) : (
              'ذخیره'
            )}
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <div className='w-full' dir='rtl'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='pb-24 sm:pb-0'>
          {/* هدر + تب‌ها (موبایل: sticky) */}
          <div className='sticky top-0 z-40 bg-background/95 backdrop-blur border-b'>
            <div className='px-4 sm:px-0 py-3 sm:py-4 max-w-4xl mx-auto'>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className='mt-3'
              >
                <TabsList className='w-full grid grid-cols-3'>
                  <TabsTrigger value='profile'>پروفایل</TabsTrigger>
                  <TabsTrigger value='work'>کاری</TabsTrigger>
                  <TabsTrigger value='notify'>اعلان‌ها</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className='max-w-4xl mx-auto px-4 sm:px-0 py-5'>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              {/* --------- TAB: PROFILE --------- */}
              <TabsContent value='profile' className='mt-0 space-y-4'>
                <Card className='p-4 sm:p-6'>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border bg-muted'>
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt='تصویر پروفایل'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <User className='h-10 w-10 text-muted-foreground' />
                          </div>
                        )}
                      </div>
                      <button
                        type='button'
                        onClick={triggerFileInput}
                        className='absolute -bottom-2 -left-2 inline-flex items-center justify-center rounded-full border bg-background p-2 shadow'
                        aria-label='تغییر تصویر'
                      >
                        <Camera className='h-4 w-4' />
                      </button>
                    </div>

                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium'>تصویر پروفایل</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        JPG/PNG/GIF — حداکثر ۵MB
                      </p>
                      <div className='mt-3 flex gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={triggerFileInput}
                          className='gap-2'
                        >
                          <Upload className='h-4 w-4' />
                          انتخاب تصویر
                        </Button>
                      </div>
                    </div>

                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept='image/*'
                      className='hidden'
                    />
                  </div>
                </Card>

                <Card className='p-4 sm:p-6'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام و نام خانوادگی</FormLabel>
                          <FormControl>
                            <Input
                              className='h-11'
                              placeholder='نام و نام خانوادگی'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='username'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام کاربری</FormLabel>
                          <FormControl>
                            <Input
                              className='h-11'
                              placeholder='نام کاربری'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ایمیل</FormLabel>
                          <FormControl>
                            <Input
                              disabled
                              type='email'
                              className='h-11'
                              placeholder='example@domain.com'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره تلفن</FormLabel>
                          <FormControl>
                            <Input
                              className='h-11'
                              placeholder='09123456789'
                              inputMode='numeric'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='jobTitle'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>عنوان شغلی</FormLabel>
                          <FormControl>
                            <Input
                              className='h-11'
                              placeholder='مثلاً: Product Designer'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='bio'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <div className='flex items-center justify-between'>
                            <FormLabel>بیوگرافی</FormLabel>
                            <span className='text-xs text-muted-foreground'>
                              {field.value?.length || 0}/500
                            </span>
                          </div>
                          <FormControl>
                            <Textarea
                              className='min-h-[120px] resize-none'
                              placeholder='درباره خودتان…'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                <StickyActions />
              </TabsContent>

              {/* --------- TAB: WORK --------- */}
              <TabsContent value='work' className='mt-0 space-y-4'>
                <Card className='p-4 sm:p-6 space-y-4'>
                  <div>
                    <p className='text-sm font-semibold'>تنظیمات کاری</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      برای زمان‌بندی‌ها و ارسال‌ها استفاده می‌شود.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name='region'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>منطقه زمانی</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || 'Asia/Tehran'}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className='h-11'>
                              <SelectValue placeholder='انتخاب منطقه زمانی' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Asia/Tehran'>
                                Asia/Tehran
                              </SelectItem>
                              {/* اگر timezone های دیگر داری اینجا اضافه کن */}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='space-y-2'>
                    <FormLabel>روزهای کاری</FormLabel>
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                      {ALL_DAYS.map((day) => {
                        const checked =
                          workSchedule?.workingDays?.includes(day.value) ||
                          false
                        return (
                          <label
                            key={day.value}
                            className='flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer select-none'
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) => {
                                const prev = workSchedule?.workingDays || []
                                const next = val
                                  ? prev.includes(day.value)
                                    ? prev
                                    : [...prev, day.value]
                                  : prev.filter((d) => d !== day.value)

                                form.setValue('workSchedule', {
                                  ...(workSchedule || {}),
                                  workingDays: next,
                                })
                              }}
                            />
                            <span>{day.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <FormItem>
                      <FormLabel>ساعت شروع</FormLabel>
                      <FormControl>
                        <Select
                          value={String(workSchedule?.startHour ?? 9)}
                          onValueChange={(v) =>
                            form.setValue('workSchedule', {
                              ...(workSchedule || {}),
                              startHour: Number(v),
                            })
                          }
                        >
                          <SelectTrigger className='h-11'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HOURS.map((h) => (
                              <SelectItem key={h} value={String(h)}>
                                {String(h).padStart(2, '0')}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>ساعت پایان</FormLabel>
                      <FormControl>
                        <Select
                          value={String(workSchedule?.endHour ?? 18)}
                          onValueChange={(v) =>
                            form.setValue('workSchedule', {
                              ...(workSchedule || {}),
                              endHour: Number(v),
                            })
                          }
                        >
                          <SelectTrigger className='h-11'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HOURS.map((h) => (
                              <SelectItem key={h} value={String(h)}>
                                {String(h).padStart(2, '0')}:00
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  </div>
                </Card>

                <StickyActions />
              </TabsContent>

              {/* --------- TAB: NOTIFY --------- */}
              <TabsContent value='notify' className='mt-0 space-y-4'>
                <Card className='p-4 sm:p-6 space-y-4'>
                  <div>
                    <p className='text-sm font-semibold'>تنظیمات اعلان‌ها</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      برای هر مورد، نوع دریافت را مشخص کن.
                    </p>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {/* In-app */}
                    <div className='rounded-xl border p-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>درون سیستم</p>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>
                            {notifAllOn
                              ? 'همه روشن'
                              : notifAllOff
                                ? 'همه خاموش'
                                : 'سفارشی'}
                          </span>
                          <Switch
                            checked={notifAllOn}
                            onCheckedChange={(checked) => {
                              const next = Object.fromEntries(
                                NOTIF_ITEMS.map((it) => [it.key, checked]),
                              )
                              form.setValue('notifConditions', next as any)
                            }}
                            aria-label='روشن/خاموش همه نوتیف‌ها'
                          />
                        </div>
                      </div>

                      <div className='mt-3 space-y-2'>
                        {NOTIF_ITEMS.map((item) => (
                          <label
                            key={item.key}
                            className='flex items-center justify-between gap-3 py-2'
                          >
                            <span className='text-sm'>{item.label}</span>
                            <Checkbox
                              checked={
                                (notifConditions as any)?.[item.key] || false
                              }
                              onCheckedChange={(val) =>
                                form.setValue('notifConditions', {
                                  ...(notifConditions || {}),
                                  [item.key]: !!val,
                                } as any)
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SMS */}
                    <div className='rounded-xl border p-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>SMS</p>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>
                            {smsAllOn
                              ? 'همه روشن'
                              : smsAllOff
                                ? 'همه خاموش'
                                : 'سفارشی'}
                          </span>
                          <Switch
                            checked={smsAllOn}
                            onCheckedChange={(checked) => {
                              const next = Object.fromEntries(
                                NOTIF_ITEMS.map((it) => [it.key, checked]),
                              )
                              form.setValue('smsConditions', next as any)
                            }}
                            aria-label='روشن/خاموش همه SMSها'
                          />
                        </div>
                      </div>

                      <div className='mt-3 space-y-2'>
                        {NOTIF_ITEMS.map((item) => (
                          <label
                            key={item.key}
                            className='flex items-center justify-between gap-3 py-2'
                          >
                            <span className='text-sm'>{item.label}</span>
                            <Checkbox
                              checked={
                                (smsConditions as any)?.[item.key] || false
                              }
                              onCheckedChange={(val) =>
                                form.setValue('smsConditions', {
                                  ...(smsConditions || {}),
                                  [item.key]: !!val,
                                } as any)
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <StickyActions />
              </TabsContent>
            </Tabs>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ProfileSetting
