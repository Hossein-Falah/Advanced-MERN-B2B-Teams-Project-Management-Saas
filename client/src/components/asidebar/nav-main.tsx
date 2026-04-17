'use client'

import { useState } from 'react'
import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  GitBranch,
  MessagesSquareIcon,
  ChevronDown,
} from 'lucide-react'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import { Link, useLocation } from 'react-router-dom'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { useAuthContext } from '@/context/auth-provider'
import { Permissions } from '@/constant'
import { useTranslation } from 'react-i18next'

type ItemType = {
  title: string
  url: string
  icon: LucideIcon
}

export function NavMain() {
  const { t } = useTranslation()
  const { hasPermission } = useAuthContext()
  const canManageSettings = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS)
  const workspaceId = useWorkspaceId()
  const location = useLocation()
  const pathname = location.pathname

  // آیتم‌های اصلی (همیشه بیرون از دراپ‌داون)
  const mainItems: ItemType[] = [
    {
      title: t('sidebar.nav.dashboard'),
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: t('sidebar.nav.messages'),
      url: `/workspace/${workspaceId}/messages`,
      icon: MessagesSquareIcon,
    },
    {
      title: t('sidebar.nav.tasks'),
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
  ]

  // آیتم‌هایی که داخل دراپ‌داون می‌روند
  const dropdownItems: ItemType[] = [
    {
      title: t('sidebar.nav.automations'),
      url: `/workspace/${workspaceId}/automations`,
      icon: GitBranch,
    },
    {
      title: t('sidebar.nav.members'),
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    ...(canManageSettings
      ? [
          {
            title: t('sidebar.nav.settings'),
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ]

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* آیتم‌های اصلی */}
        {mainItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.url === pathname} asChild>
              <Link to={item.url} className='!text-[15px]'>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {/* دراپ‌داون سفارشی */}
        {dropdownItems.length > 0 && (
          <SidebarMenuItem>
            {/* دکمه باز/بسته شدن دراپ‌داون */}
            <SidebarMenuButton
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <ChevronDown
                className={`ml-auto transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
              <span>{t('sidebar.nav.management') || 'مدیریت'}</span>
            </SidebarMenuButton>

            {/* زیرمنو (دراپ‌داون) که در صورت باز بودن نمایش داده می‌شود */}
            {isDropdownOpen && (
              <SidebarMenuSub>
                {dropdownItems.map((item) => (
                  <SidebarMenuSubItem key={item.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={item.url === pathname}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
