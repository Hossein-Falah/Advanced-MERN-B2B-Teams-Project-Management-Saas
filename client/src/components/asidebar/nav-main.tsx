import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  GitBranch,
  MessagesSquareIcon,
  ChartArea,
} from 'lucide-react'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { Link, useLocation } from 'react-router-dom'
import useWorkspaceId from '@/hooks/use-workspace-id'
import { useAuthContext } from '@/context/auth-provider'
import { Permissions } from '@/constant'
import { useTranslation } from 'react-i18next'
import { Separator } from '../ui/separator'

// تعریف نوع برای آیتم‌ها (معمولی یا جداکننده)
type NavItem =
  | { type: 'item'; title: string; url: string; icon: LucideIcon }
  | { type: 'separator' }

export function NavMain() {
  const { t } = useTranslation()
  const { hasPermission } = useAuthContext()
  const canManageSettings = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS)

  const workspaceId = useWorkspaceId()
  const location = useLocation()
  const pathname = location.pathname

  // ساخت آرایه آیتم‌ها با قابلیت جداکننده
  const items: NavItem[] = [
    {
      type: 'item',
      title: t('sidebar.nav.dashboard'),
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      type: 'item',
      title: t('sidebar.nav.messages'),
      url: `/workspace/${workspaceId}/messages`,
      icon: MessagesSquareIcon,
    },
    {
      type: 'item',
      title: t('sidebar.nav.tasks'),
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      type: 'item',
      title: t('sidebar.nav.automations'),
      url: `/workspace/${workspaceId}/automations`,
      icon: GitBranch,
    },
    { type: 'separator' }, // جداکننده قبل از اعضا
    {
      type: 'item',
      title: t('sidebar.nav.analytics'),
      url: `/workspace/${workspaceId}/analytics`,
      icon: ChartArea,
    },
    {
      type: 'item',
      title: t('sidebar.nav.members'),
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    ...(canManageSettings
      ? [
          {
            type: 'item' as const,
            title: t('sidebar.nav.settings'),
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ]

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <Separator key={`sep-${index}`} />
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton isActive={item.url === pathname} asChild>
                <Link to={item.url} className='!text-[15px]'>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
