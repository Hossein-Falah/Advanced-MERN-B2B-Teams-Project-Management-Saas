import {
  PermissionType,
  TaskPriorityEnumType,
  TaskStatusEnumType,
} from '@/constant'

export type loginType = { email: string; password: string }
export type LoginResponseType = {
  message: string
  user: {
    _id: string
    currentWorkspace: string
  }
}

export type registerType = {
  name: string
  email: string
  password: string
}

// USER TYPE
export type WorkScheduleType = {
  workingDays: number[]
  startHour: number
  endHour: number
}

export type NotifConditionsType = {
  onCreateTask: boolean
  onUpdateTask: boolean
  onMention: boolean
  onAutomationAction: boolean
  onMessage: boolean
}

export type SmsConditionsType = {
  onCreateTask: boolean
  onUpdateTask: boolean
  onMention: boolean
  onAutomationAction: boolean
  onMessage: boolean
}

export type UserType = {
  _id: string
  name: string
  email: string
  username?: string
  phone?: string
  jobTitle?: string
  bio?: string
  isOnline: boolean
  lastSeen: string | null

  profilePicture: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string // یا Date، بسته به جواب API؛ اگر API استرینگ می‌فرستد بهتره string باشه
  updatedAt: string // همین‌طور این

  currentWorkspace: {
    _id: string
    name: string
    owner: string
    inviteCode: string
  }

  // فیلدهای جدید
  region?: string
  workSchedule?: WorkScheduleType
  notifConditions?: NotifConditionsType
  smsConditions?: SmsConditionsType
}

export type CurrentUserResponseType = {
  message: string
  user: UserType
}

//******** */ WORLSPACE TYPES ****************
// ******************************************
export type WorkspaceType = {
  _id: string
  name: string
  description?: string
  owner: string
  inviteCode: string
}

export type CreateWorkspaceType = {
  name: string
  description: string
}

export type EditWorkspaceType = {
  workspaceId: string
  data: {
    name: string
    description: string
  }
}

export type CreateWorkspaceResponseType = {
  message: string
  workspace: WorkspaceType
}

export type AllWorkspaceResponseType = {
  message: string
  workspaces: WorkspaceType[]
}

export type WorkspaceWithMembersType = WorkspaceType & {
  members: {
    _id: string
    userId: string
    workspaceId: string
    role: {
      _id: string
      name: string
      permissions: PermissionType[]
    }
    joinedAt: string
    createdAt: string
  }[]
}

export type WorkspaceByIdResponseType = {
  message: string
  workspace: WorkspaceWithMembersType
}

export type ChangeWorkspaceMemberRoleType = {
  workspaceId: string
  data: {
    roleId: string
    memberId: string
  }
}

export type AllMembersInWorkspaceResponseType = {
  message: string
  members: {
    _id: string
    userId: UserType
    workspaceId: string
    role: {
      _id: string
      name: string
    }
    joinedAt: string
    createdAt: string
  }[]
  roles: RoleType[]
}

export type AnalyticsResponseType = {
  message: string
  analytics: {
    totalTasks: number
    overdueTasks: number
    completedTasks: number
  }
}

export type PaginationType = {
  totalCount: number
  pageSize: number
  pageNumber: number
  totalPages: number
  skip: number
  limit: number
}

export type RoleType = {
  _id: string
  name: string
}
// *********** MEMBER ****************

//******** */ PROJECT TYPES ****************
//****************************************** */
export type ProjectType = {
  _id: string
  name: string
  emoji: string
  description: string
  workspace: string
  createdBy: {
    _id: string
    name: string
    username: string
    profilePicture: string
  }
  createdAt: string
  updatedAt: string
}

export type CreateProjectPayloadType = {
  workspaceId: string
  data: {
    emoji: string
    name: string
    description: string
  }
}

export type ProjectResponseType = {
  message: 'Project created successfully'
  project: ProjectType
}

export type EditProjectPayloadType = {
  workspaceId: string
  projectId: string
  data: {
    emoji: string
    name: string
    description: string
  }
}

//ALL PROJECTS IN WORKSPACE TYPE
export type AllProjectPayloadType = {
  workspaceId: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
  skip?: boolean
}

export type AllProjectResponseType = {
  message: string
  projects: ProjectType[]
  pagination: PaginationType
}

// SINGLE PROJECT IN WORKSPACE TYPE
export type ProjectByIdPayloadType = {
  workspaceId: string
  projectId: string
}

//********** */ TASK TYPES ************************
//************************************************* */
export type CreateTaskPayloadType = {
  workspaceId: string
  projectId: string
  data: FormData
}

//added new for edtiting of task
export type EditTaskPayloadType = {
  taskId: string
  workspaceId: string
  projectId: string
  data: Partial<FormData>
}

export type TaskType = {
  _id: string
  title: string
  description?: string

  project?: {
    _id: string
    emoji: string
    name: string
  }
  priority: TaskPriorityEnumType
  status: TaskStatusEnumType
  assignedTo: UserType | null
  createdBy?: string
  dueDate: string
  startDate: string
  taskCode: string
  createdAt?: string
  updatedAt?: string
  attachment?: string
}

export type AllTaskPayloadType = {
  taskId?: string
  workspaceId: string
  projectId?: string | null
  keyword?: string | null
  priority?: TaskPriorityEnumType | null
  status?: TaskStatusEnumType | null
  assignedTo?: string | null
  dueDate?: string | null
  startDate?: string | null
  pageNumber?: number | null
  pageSize?: number | null
}

export type AllTaskResponseType = {
  message: string
  tasks: TaskType[]
  pagination: PaginationType
}

export type CommentType = {
  _id: string
  id: string
  content: string
  attachment?: string
  task: string
  workspace: string
  user: UserType
  createdAt: string
  updatedAt: string
  __v: number
}
export type AllCommentResponseType = {
  message: string
  comments: {
    comments: CommentType[]
    pagination: PaginationType
  }
}

export type GetAllCommentParamsType = {
  taskId: string
  workspaceId: string
}
export type CreateCommentParamsType = {
  taskId: string
  workspaceId: string
  data: FormData
}
