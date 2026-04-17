import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { CheckIcon, ChevronDownIcon, Earth } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'fa', label: 'فارسی' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className='  inline-flex items-center gap-1 rounded-md  px-3 py-1 text-sm font-medium text-gray-700  focus:outline-none focus:ring-2 focus:ring-indigo-500'
        aria-label='Select Language'
      >
        <Earth className='w-4 h-4' />
        {languages.find((l) => l.code === currentLang)?.label ||
          currentLang.toUpperCase()}
        <ChevronDownIcon className='w-5 h-5' />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className='bg-white z-50 rounded-md shadow-md p-1 mt-2 min-w-[140px]'
        sideOffset={5}
      >
        {languages.map(({ code, label }) => (
          <DropdownMenu.Item
            key={code}
            className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer select-none z-50
              
              ${
                currentLang === code
                  ? 'bg-accent-foreground text-white'
                  : 'text-gray-900 hover:bg-slate-100 '
              }
            `}
            onSelect={() => changeLang(code)}
          >
            {currentLang === code && <CheckIcon className='mr-2 h-4 w-4' />}
            {label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
