import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import useWorkspaceId from '@/hooks/use-workspace-id'

type AvatarProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> & {
  toUser?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, toUser, ...props }, ref) => {
  const workspaceId = useWorkspaceId()
  const avatar = (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full text-[12px] cursor-pointer',
        className,
      )}
      {...props}
    />
  )

  if (toUser) {
    return (
      <Link to={`/workspace/${workspaceId}/profile/${toUser}`}>{avatar}</Link>
    )
  }

  return avatar
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.memo(
  React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
  >(({ className, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = React.useState(false)

    return (
      <>
        {!isLoaded && <div className='absolute inset-0 rounded-full ' />}
        <AvatarPrimitive.Image
          ref={ref}
          className={cn(
            'aspect-square h-full w-full transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          {...props}
        />
      </>
    )
  }),
)
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
