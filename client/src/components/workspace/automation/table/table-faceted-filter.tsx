import * as React from 'react'
import { Check, PlusCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

interface Option {
  label: string | React.ReactNode
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DataTableFacetedFilterProps {
  title?: string
  options: Option[]
  selectedValues: string[]
  onFilterChange: (values: string[]) => void
  multiSelect?: boolean
  disabled?: boolean
}

export function DataTableFacetedFilter({
  title,
  options,
  selectedValues,
  onFilterChange,
  multiSelect = true,
  disabled,
}: DataTableFacetedFilterProps) {
  const [open, setOpen] = React.useState(false)

  const selectedValueSet = new Set(selectedValues)

  const handleSelect = (value: string) => {
    const isSelected = selectedValueSet.has(value)

    if (multiSelect) {
      const newValues = isSelected
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]

      onFilterChange(newValues)
    } else {
      const newValues = isSelected ? [] : [value]
      onFilterChange(newValues)
      setOpen(false)
    }
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-8 border-dashed w-full lg:w-auto'
          disabled={disabled}
        >
          <PlusCircle className='ml-2 h-4 w-4' />
          {title}

          {selectedValueSet.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-1 h-4' />

              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValueSet.size}
              </Badge>

              <div className='hidden lg:flex space-x-1 rtl:space-x-reverse'>
                {selectedValueSet.size > 1 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValueSet.size}
                  </Badge>
                ) : (
                  options
                    .filter((o) => selectedValueSet.has(o.value))
                    .map((o) => (
                      <Badge
                        key={o.value}
                        variant='secondary'
                        className='rounded-sm px-1 font-normal'
                      >
                        {o.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={`جستجوی ${title}`} />

          <CommandList>
            <CommandEmpty>نتیجه‌ای یافت نشد</CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValueSet.has(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className='cursor-pointer'
                  >
                    {multiSelect && (
                      <div
                        className={cn(
                          'ml-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible',
                        )}
                      >
                        <Check className='h-4 w-4' />
                      </div>
                    )}

                    {option.icon && (
                      <option.icon className='ml-2 h-4 w-4 text-muted-foreground' />
                    )}

                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {selectedValueSet.size > 0 && (
              <>
                <CommandSeparator />

                <CommandGroup>
                  <CommandItem
                    onSelect={() => onFilterChange([])}
                    className='justify-center text-center'
                  >
                    پاک کردن فیلترها
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
