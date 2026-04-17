// src/components/ui/collapsible.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

type CollapsibleContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null
)

type CollapsibleProps = {
  children: React.ReactNode
  /** کنترل باز/بسته بودن از بیرون (Controlled) */
  open?: boolean
  /** اگر بدی، هر تغییری در وضعیت بهت اطلاع داده میشه */
  onOpenChange?: (open: boolean) => void
  /** کلاس برای ریشه‌ی کامپوننت */
  className?: string
}

/**
 * کامپوننت ریشه‌ی Collapsible
 * در حالت controlled: prop های `open` و `onOpenChange` رو استفاده کن
 * در حالت uncontrolled: فقط از `defaultOpen` می‌تونه استفاده بکنه (اگر اضافه خواستی)
 */
export const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  open,
  onOpenChange,
  className,
}) => {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(false)

  const actualOpen = isControlled ? open : internalOpen

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }

  // این هندلر رو برای Trigger به اشتراک می‌ذاریم
  const contextValue = React.useMemo(
    () => ({
      open: actualOpen,
      setOpen,
    }),
    [actualOpen]
  )

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <div
        className={cn('collapsible-root', className)}
        data-state={actualOpen ? 'open' : 'closed'}
      >
        {/* 
          اینجا children هم Trigger می‌تونه باشه هم Content.
          خود Trigger و Content از context استفاده می‌‎کنن.
        */}
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

// -------- CollapsibleTrigger --------

type CollapsibleTriggerProps = {
  children: React.ReactNode
  /** اگر true باشه، به جای div پدر، مستقیم روی child کلیک‌هندلر رو می‌چسبونیم */
  asChild?: boolean
  className?: string
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  asChild,
  className,
}) => {
  const context = React.useContext(CollapsibleContext)

  if (!context) {
    // اگر خارج از Collapsible استفاده بشه، چیزی رندر نکن
    console.warn(
      '[CollapsibleTrigger] used outside of <Collapsible /> – حتماً Trigger داخل Collapsible باشه.'
    )
    return null
  }

  const { open, setOpen } = context

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    // وقتی asChild هست، props رو روی child تزریق می‌کنیم
    return React.cloneElement(children as React.ReactElement, {
      onClick: (event: React.MouseEvent) => {
        // اول onClick خودش اگر بود
        ;(children as React.ReactElement).props.onClick?.(event)
        if (!event.defaultPrevented) {
          handleClick(event)
        }
      },
      'data-state': open ? 'open' : 'closed',
    })
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn('collapsible-trigger', className)}
      data-state={open ? 'open' : 'closed'}
    >
      {children}
    </button>
  )
}

// -------- CollapsibleContent --------

type CollapsibleContentProps = {
  children: React.ReactNode
  className?: string
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  className,
}) => {
  const context = React.useContext(CollapsibleContext)

  if (!context) {
    console.warn(
      '[CollapsibleContent] used outside of <Collapsible /> – حتماً Content داخل Collapsible باشه.'
    )
    return null
  }

  const { open } = context

  return (
    <div
      className={cn(
        'collapsible-content overflow-hidden transition-all duration-200',
        open
          ? 'data-[state=open]:animate-collapseDown'
          : 'data-[state=closed]:animate-collapseUp',
        className
      )}
      data-state={open ? 'open' : 'closed'}
      style={{
        maxHeight: open ? '1000px' : '0px',
      }}
    >
      {open && children}
    </div>
  )
}
