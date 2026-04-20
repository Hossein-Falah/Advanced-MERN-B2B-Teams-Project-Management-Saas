'use client'

import { useQuery } from '@tanstack/react-query'
import { FolderKanban, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnalyticsCard from './analytics-card'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { getWorkspaceProjectsAnalyticsQueryFn } from '@/lib/api/analytics'

type Project = {
  project_id: string
  project_name: string
  total_tasks: number
  completed_tasks: number
  progress_percent: number
}

// کامپوننت کارت پروژه با انیمیشن
const ProjectCard = ({
  project,
  index,
}: {
  project: Project
  index: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      }}
      className='rounded-xl border border-border bg-gradient-to-br from-card to-background p-4 shadow-sm transition-all duration-200'
    >
      <div className='flex justify-between items-start'>
        <h4 className='text-sm font-semibold text-foreground line-clamp-1'>
          {project.project_name}
        </h4>
        <span className='text-xs font-mono bg-muted px-2 py-0.5 rounded-full text-muted-foreground'>
          {project.completed_tasks}/{project.total_tasks}
        </span>
      </div>

      <div className='mt-3'>
        <div className='mb-1.5 flex justify-between text-xs'>
          <span className='text-muted-foreground'>پیشرفت</span>
          <motion.span
            key={project.progress_percent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='font-medium text-emerald-600 dark:text-emerald-400'
          >
            {project.progress_percent}%
          </motion.span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-secondary/60'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress_percent}%` }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
            className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]'
          />
        </div>
      </div>
    </motion.div>
  )
}

// اسکلتون لودینگ برای کارت‌های پروژه
const ProjectCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className='rounded-xl border border-border bg-card/50 p-4'
  >
    <div className='flex justify-between'>
      <div className='h-5 w-2/3 rounded-md bg-muted animate-pulse' />
      <div className='h-5 w-12 rounded-full bg-muted animate-pulse' />
    </div>
    <div className='mt-4 space-y-2'>
      <div className='flex justify-between'>
        <div className='h-3 w-12 rounded bg-muted animate-pulse' />
        <div className='h-3 w-8 rounded bg-muted animate-pulse' />
      </div>
      <div className='h-2 w-full rounded-full bg-muted animate-pulse' />
    </div>
  </motion.div>
)

export default function ProjectsAnalytics() {
  const workspaceId = useWorkspaceId()

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['workspace-projects-analytics', workspaceId],
    queryFn: () => getWorkspaceProjectsAnalyticsQueryFn({ workspaceId }),
    enabled: !!workspaceId,
  })

  // تبدیل داده‌های API به فرمت مورد نیاز کامپوننت
  const projects: Project[] =
    projectsData?.data?.projectAnalytics?.map((item) => ({
      project_id: item.project_id,
      project_name: item.project_name,
      total_tasks: item.total_tasks,
      completed_tasks: item.completed_tasks,
      progress_percent: item.progress_percent,
    })) || []

  const avgProgress = projects.length
    ? Math.round(
        projects.reduce((sum, p) => sum + p.progress_percent, 0) /
          projects.length
      )
    : 0

  return (
    <section className='space-y-5'>
      {/* هدر با انیمیشن */}
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className='text-xl font-bold flex items-center gap-2 text-foreground'
      >
        <FolderKanban size={22} className='text-purple-500' />
        آمار پروژه‌ها
      </motion.h2>

      {/* دو کارت اصلی با انیمیشن */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <AnalyticsCard
          isLoading={loadingProjects}
          title='تعداد پروژه‌ها'
          value={projects.length}
          icon={<FolderKanban size={14} />}
          color='purple'
        />

        <AnalyticsCard
          isLoading={loadingProjects}
          title='میانگین پیشرفت'
          value={avgProgress}
          isPrecent
          icon={<TrendingUp size={14} />}
          color='purple'
        />
      </div>

      {/* لیست پروژه‌ها با انیمیشن استگر */}
      <div className='grid gap-3 sm:grid-cols-2'>
        <AnimatePresence mode='wait'>
          {loadingProjects
            ? // نمایش اسکلتون‌ها در حین بارگذاری
              Array.from({ length: 2 }).map((_, idx) => (
                <ProjectCardSkeleton key={`skeleton-${idx}`} index={idx} />
              ))
            : projects.map((project, idx) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  index={idx}
                />
              ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
