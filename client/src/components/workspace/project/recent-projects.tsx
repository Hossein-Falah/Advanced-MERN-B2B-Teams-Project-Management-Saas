import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useWorkspaceId from '@/hooks/use-workspace-id'
import useGetProjectsInWorkspaceQuery from '@/hooks/api/use-get-projects'
import { Loader } from 'lucide-react'
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import { useTranslation } from 'react-i18next'

const RecentProjects = () => {
  const { t } = useTranslation()

  const workspaceId = useWorkspaceId()

  const { data, isPending } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 10,
  })

  const projects = data?.data?.projects || []

  return (
    <div className='flex flex-col pt-2'>
      {isPending ? (
        <Loader className='w-8 h-8 animate-spin place-self-center flex' />
      ) : null}

      {projects?.length === 0 && (
        <div className='font-semibold text-sm text-muted-foreground text-center py-5'>
          {t('projects.recentProjects.empty')}
        </div>
      )}

      <ul role='list' className='space-y-2'>
        {projects.map((project) => {
          const name = project.createdBy.name
          const initials = getAvatarFallbackText(name)
          const avatarColor = getAvatarColor(name)

          return (
            <li
              key={project._id}
              role='listitem'
              className='shadow-none cursor-pointer border-0 py-2 hover:bg-gray-50 transition-colors ease-in-out'
            >
              <Link
                to={`/workspace/${workspaceId}/project/${project._id}`}
                className='grid gap-8 p-0'
              >
                <div className='flex items-start gap-2'>
                  <div className='text-xl !leading-[1.4rem]'>
                    {project.emoji}
                  </div>

                  <div className='grid gap-1'>
                    <p className='text-sm font-medium leading-none'>
                      {project.name}
                    </p>

                    <p className='text-sm text-muted-foreground'>
                      {project.createdAt
                        ? formatJalali(new Date(project.createdAt), 'PPP', {
                            locale: faIR,
                          })
                        : null}
                    </p>
                  </div>

                  <div className='mr-auto flex items-center gap-4'>
                    <span className='text-sm text-gray-500'>
                      {t('projects.recentProjects.createdBy')}
                    </span>

                    <Avatar className='h-9 w-9 sm:flex'>
                      <AvatarImage
                        src={project.createdBy.profilePicture || ''}
                        alt='Avatar'
                      />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentProjects
