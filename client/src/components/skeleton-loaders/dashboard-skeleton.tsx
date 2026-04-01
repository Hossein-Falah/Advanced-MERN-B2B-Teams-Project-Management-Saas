import { Skeleton } from '@/components/ui/skeleton'
import { Loader } from 'lucide-react'

export function DashboardSkeleton() {
  return (
    <div className='relative p-4 md:p-6 animate-in fade-in duration-700 zoom-in-95'>
      {/* Loader overlay */}
      <div className='absolute inset-0 z-50 flex items-start pt-16 justify-center bg-white/5 backdrop-blur-sm'>
        <div className='flex items-center space-x-2'>
          <Loader size={22} className='animate-spin' />
          <span className='text-sm font-medium'>در حال بارگذاری...</span>
        </div>
      </div>

      {/* Layout */}
      <div className='flex gap-6'>
        {/* Sidebar (hidden on mobile) */}
        <aside className='hidden w-60 shrink-0 flex-col space-y-6 md:flex'>
          <Skeleton className='h-8 w-40' />

          <div className='space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-6 w-28' />
            <Skeleton className='h-6 w-36' />
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>

          <Skeleton className='h-10 w-full rounded-md' />
        </aside>

        {/* Main content */}
        <main className='flex-1 space-y-6'>
          {/* Header */}
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-10 w-32 rounded-md' />
          </div>

          {/* Dashboard Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Skeleton className='h-28 rounded-xl' />
            <Skeleton className='h-28 rounded-xl' />
            <Skeleton className='h-28 rounded-xl' />
            <Skeleton className='h-28 rounded-xl' />
          </div>

          {/* Table section */}
          <div className='space-y-4'>
            <Skeleton className='h-7 w-40' />

            <div className='space-y-3'>
              {[...Array(8)].map((_, i) => (
                <div key={i} className='flex justify-between items-center'>
                  <Skeleton className='h-6 w-64' />
                  <Skeleton className='h-6 w-10 rounded-full' />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
