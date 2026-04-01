import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { getAllTasksQueryFn } from '@/lib/api/api'
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from '@/lib/helper'
import { TaskType } from '@/types/api.type'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { Loader } from 'lucide-react'

const RecentTasks = () => {
  const workspaceId = useWorkspaceId()

  const { data, isLoading } = useQuery({
    queryKey: ['all-tasks', workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  })

  const tasks: TaskType[] = data?.tasks || []

  return (
    <div className='flex flex-col space-y-6' dir='rtl'>
      {isLoading ? (
        <Loader
          className='w-8 h-8 
        animate-spin
        place-self-center flex
        '
        />
      ) : null}

      {tasks?.length === 0 && (
        <div
          className='font-semibold
         text-sm text-muted-foreground
          text-center py-5'
        >
          هنوز وظیفه ی ایجاد نشده است
        </div>
      )}

      <ul role='list' className='divide-y divide-gray-200'>
        {tasks.map((task) => {
          const name = task?.assignedTo?.name || ''
          const initials = getAvatarFallbackText(name)
          const avatarColor = getAvatarColor(name)
          return (
            <li
              key={task._id}
              className='p-4 flex items-center justify-between hover:bg-gray-50 transition-colors'
            >
              {/* اطلاعات وظیفه  */}
              <div className='flex flex-col space-y-1 flex-grow'>
                <span className='text-sm capitalize text-gray-600 font-medium'>
                  {task.taskCode}
                </span>
                <p className='text-md font-semibold text-gray-800 truncate'>
                  {task.title}
                </p>
                <span className='text-sm text-gray-500'>
                  سررسید:{' '}
                  {task.dueDate
                    ? format(new Date(task.dueDate), 'PPP', { locale: faIR })
                    : null}
                </span>
              </div>

              {/* وضعیت وظیفه  */}
              <div className='text-sm font-medium '>
                <Badge
                  variant={TaskStatusEnum[task.status]}
                  className='flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0'
                >
                  <span>{transformStatusEnum(task.status)}</span>
                </Badge>
              </div>

              {/* اولویت وظیفه  */}
              <div className='text-sm mr-2'>
                <Badge
                  variant={TaskPriorityEnum[task.priority]}
                  className='flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0'
                >
                  <span>{transformStatusEnum(task.priority)}</span>
                </Badge>
              </div>

              {/* مسئول */}
              <div className='flex items-center space-x-2 mr-2 rtl:space-x-reverse'>
                <Avatar toUser={task.assignedTo?.username} className='h-8 w-8'>
                  <AvatarImage
                    src={task.assignedTo?.profilePicture || ''}
                    alt={task.assignedTo?.name}
                  />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentTasks
