import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CheckCircle2,
  BarChart2,
  Mail,
  Phone,
  Inbox,
} from 'lucide-react'
import { DateRangeSelector } from '@/components/ui/date-range-selector'
import AnalyticsCard from './analytics-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getWorkspaceUsersAnalyticsQueryFn } from '@/lib/api/analytics'
import { WorkspaceUserAnalyticsItem } from '@/types/analytics.type'
import useWorkspaceId from '@/hooks/use-workspace-id'
import ProfileActivityTimelineDialog from '@/components/workspace/common/user-activity-dialog/activity-dialog'

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

// تابع رنگ‌بندی بر اساس تعداد وظایف
const getTaskBadgeStyle = (count: number) => {
  if (count > 10)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  if (count < 10)
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
}

// اسکلت لودینگ زیباتر
const TableRowSkeleton = () => (
  <TableRow className='animate-pulse'>
    <TableCell className='font-medium'>
      <div className='flex items-center gap-3'>
        <div className='h-10 w-10 rounded-full bg-muted' />
        <div className='space-y-2'>
          <div className='h-4 w-28 rounded bg-muted' />
          <div className='h-3 w-36 rounded bg-muted' />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className='h-4 w-32 rounded bg-muted' />
    </TableCell>
    <TableCell>
      <div className='h-4 w-24 rounded bg-muted' />
    </TableCell>
    <TableCell>
      <div className='h-8 w-16 rounded-full bg-muted mx-auto' />
    </TableCell>
    <TableCell>
      <div className='h-8 w-16 rounded-md bg-muted mx-auto' />
    </TableCell>
  </TableRow>
)

export default function UsersAnalytics() {
  const workspaceId = useWorkspaceId()
  const [userRange, setUserRange] = useState({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  })

  const [selectedUser, setSelectedUser] = useState<{
    id: string
    username: string
  } | null>(null)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-users-analytics', userRange],
    queryFn: () =>
      getWorkspaceUsersAnalyticsQueryFn({
        workspaceId,
        start_date: formatDate(userRange.startDate),
        end_date: formatDate(userRange.endDate),
      }),
  })

  const users: WorkspaceUserAnalyticsItem[] = data?.data?.userAnalytics ?? []
  const totalAssigned = users.reduce((sum, u) => sum + u.assigned_count, 0)

  const handleShowStats = (userId: string, username: string) => {
    setSelectedUser({ id: userId, username })
    setIsTimelineOpen(true)
  }

  return (
    <section className='space-y-6'>
      {/* هدر و رنج تاریخ */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
            <Users className='h-6 w-6 text-primary' />
            آمار کاربران
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>
            عملکرد و وظایف محول‌شده به کاربران در بازه انتخابی
          </p>
        </div>
        <DateRangeSelector value={userRange} onChange={setUserRange} />
      </div>

      {/* کارت‌های آماری */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-2'>
        <AnalyticsCard
          isLoading={isLoading}
          title='وظایف محول شده'
          value={totalAssigned}
          icon={<CheckCircle2 className='h-4 w-4' />}
          color='green'
        />
        <AnalyticsCard
          isLoading={isLoading}
          title='کاربران فعال'
          value={users.length}
          icon={<Users className='h-4 w-4' />}
          color='green'
        />
      </div>

      {/* جدول کاربران */}
      <div className='rounded-xl border bg-card shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300'>
        <div className='overflow-x-auto'>
          <Table dir='rtl'>
            {/* هدر با گرادیانت و حاشیه رنگی */}
            <TableHeader className='bg-gradient-to-r from-muted/80 to-muted/40 border-b-2 border-primary/20'>
              <TableRow>
                <TableHead className='text-right w-[280px] font-bold text-primary'>
                  کاربر
                </TableHead>
                <TableHead className='text-right hidden md:table-cell font-bold text-primary'>
                  ایمیل
                </TableHead>
                <TableHead className='text-right hidden lg:table-cell font-bold text-primary'>
                  شماره تماس
                </TableHead>
                <TableHead className='text-center font-bold text-primary'>
                  تعداد وظایف
                </TableHead>
                <TableHead className='w-[100px] text-center font-bold text-primary'>
                  عملیات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-48 text-center'>
                    <div className='flex flex-col items-center justify-center text-muted-foreground'>
                      <div className='rounded-full bg-muted/30 p-4 mb-4'>
                        <Inbox className='h-12 w-12 text-primary/40' />
                      </div>
                      <p className='text-lg font-medium'>هیچ کاربری یافت نشد</p>
                      <p className='text-sm text-muted-foreground/70'>
                        بازه تاریخ را تغییر دهید
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {users.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className='group border-b transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent'
                    >
                      {/* ستون کاربر */}
                      <TableCell className='font-medium py-4'>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-10 w-10 ring-1 ring-border/50 group-hover:ring-primary/30 transition-all duration-200 shadow-sm'>
                            <AvatarImage
                              src={user.profilePicture || ''}
                              alt={user.name}
                            />
                            <AvatarFallback className='bg-gradient-to-br from-primary/80 to-primary text-white text-sm font-bold'>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-semibold text-foreground line-clamp-1'>
                              {user.name}
                            </div>
                            <div className='text-xs text-muted-foreground flex items-center gap-1 md:hidden'>
                              <Mail className='h-3 w-3' />
                              <span className='truncate max-w-[120px]'>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* ایمیل */}
                      <TableCell className='hidden md:table-cell text-muted-foreground py-4'>
                        <div className='flex items-center gap-1.5'>
                          <Mail className='h-3.5 w-3.5 text-muted-foreground/70' />
                          <span className='text-sm'>{user.email}</span>
                        </div>
                      </TableCell>

                      {/* شماره تماس */}
                      <TableCell className='hidden lg:table-cell py-4'>
                        {user.phone ? (
                          <div className='flex items-center gap-1.5'>
                            <Phone className='h-3.5 w-3.5 text-muted-foreground/70' />
                            <span className='text-sm font-mono'>
                              {user.phone}
                            </span>
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground/60'>
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* تعداد وظایف با Badge رنگی */}
                      <TableCell className='text-center py-4'>
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold tabular-nums shadow-sm ${getTaskBadgeStyle(
                            user.assigned_count
                          )}`}
                        >
                          {user.assigned_count.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* دکمه آمار */}
                      <TableCell className='text-center py-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200'
                          onClick={() =>
                            handleShowStats(
                              user._id,
                              user.username || user.name
                            )
                          }
                        >
                          <BarChart2 className='h-4 w-4' />
                          <span className='hidden sm:inline'>آمار</span>
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* دیالوگ جزئیات فعالیت */}
      {selectedUser && (
        <ProfileActivityTimelineDialog
          userId={selectedUser.id}
          open={isTimelineOpen}
          onOpenChange={setIsTimelineOpen}
          title={`آمار فعالیت ${selectedUser.username}`}
          username={selectedUser.username}
        />
      )}
    </section>
  )
}
