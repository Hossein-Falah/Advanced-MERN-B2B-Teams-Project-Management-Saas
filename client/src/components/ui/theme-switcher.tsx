import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Sun, Moon, ChevronDownIcon, CheckIcon, MonitorCog } from 'lucide-react'
import { useState } from 'react'

const themes = [
  { value: 'light', label: 'روشن', icon: Sun },
  { value: 'dark', label: 'تیره', icon: Moon },
]

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('system') // فقط نمایشی

  const handleThemeChange = (value: string) => {
    // TODO: اینجا بعداً لاجیک واقعی تغییر تم رو اضافه کن
    setTheme(value)
  }

  const CurrentIcon = themes.find((t) => t.value === theme)?.icon || MonitorCog

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className='inline-flex items-center gap-2 rounded-md  px-3 py-1 text-sm font-medium text-gray-700  focus:outline-none focus:ring-2 focus:ring-indigo-500'
        aria-label='Select Theme'
      >
        <CurrentIcon className='w-4 h-4' />
        تم برنامه
        <ChevronDownIcon className='w-5 h-5' />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className='bg-white z-50 rounded-md shadow-md p-1 mt-2 min-w-[150px]'
        sideOffset={5}
      >
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenu.Item
            key={value}
            className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer select-none gap-2 z-50
              ${
                theme === value
                  ? 'bg-accent-foreground text-white'
                  : 'text-gray-900 hover:bg-slate-100'
              }
            `}
            onSelect={() => handleThemeChange(value)}
          >
            {theme === value && <CheckIcon className='w-4 h-4' />}
            <Icon className='w-4 h-4' />
            {label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
