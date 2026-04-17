import { WorkspaceRoles } from '@/constant'

export const getRoleDisplayName = (
  roleName: string,
  t: (key: string) => string
) => {
  const role = WorkspaceRoles[roleName as keyof typeof WorkspaceRoles]

  return t(`roles.${role}`) || '-'
}
