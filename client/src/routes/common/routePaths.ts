export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname)
}

export const AUTH_ROUTES = {
  SIGN_IN: '/',
  SIGN_UP: '/sign-up',
  GOOGLE_OAUTH_CALLBACK: '/google/oauth/callback',
}

export const PROTECTED_ROUTES = {
  WORKSPACE: '/workspace/:workspaceId',
  ANALYTICS: '/workspace/:workspaceId/analytics',
  TASKS: '/workspace/:workspaceId/tasks',
  AUTOMATIONS: '/workspace/:workspaceId/automations',
  MEMBERS: '/workspace/:workspaceId/members',
  SETTINGS: '/workspace/:workspaceId/settings',
  PROJECT_DETAILS: '/workspace/:workspaceId/project/:projectId',
  PROFILE_SETTINGS: '/workspace/:workspaceId/profile/settings',
  PROFILE_PUBLIC: '/workspace/:workspaceId/profile/:username',
}

export const BASE_ROUTE = {
  INVITE_URL: '/invite/workspace/:inviteCode/join',
}
