import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const ProfileViewSkeleton = () => {
  return (
    <div className='w-full max-w-5xl mx-auto p-4 lg:p-6' dir='rtl'>
      <Card className='border border-gray-200/70 dark:border-gray-800'>
        <CardHeader className='pb-3 border-b border-gray-100 dark:border-gray-800'>
          <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3'>
            <div className='flex items-center gap-4'>
              <Skeleton className='w-20 h-20 lg:w-24 lg:h-24 rounded-full' />

              <div className='space-y-2'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-3 w-52' />
              </div>
            </div>

            <Skeleton className='h-6 w-20 rounded-full' />
          </div>
        </CardHeader>

        <CardContent className='pt-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* ستون اصلی */}
            <div className='lg:col-span-2 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
                <Skeleton className='h-12 w-full' />
              </div>

              <Separator />

              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-16 w-full rounded-md' />
              </div>
            </div>

            {/* ستون کناری */}
            <div className='space-y-3'>
              <div className='border rounded-md p-3 space-y-2'>
                <Skeleton className='h-4 w-24 mb-2' />
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-3/4' />
                <Skeleton className='h-3 w-2/3' />
              </div>

              <div className='border rounded-md p-3 space-y-2'>
                <Skeleton className='h-4 w-24 mb-2' />
                <div className='flex gap-2 flex-wrap'>
                  <Skeleton className='h-5 w-20 rounded-full' />
                  <Skeleton className='h-5 w-24 rounded-full' />
                  <Skeleton className='h-5 w-16 rounded-full' />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileViewSkeleton
