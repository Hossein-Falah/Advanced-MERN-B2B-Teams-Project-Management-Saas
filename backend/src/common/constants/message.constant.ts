export const MESSAGES = {
    AUTOMATION: {
        CREATED: {
            code: "AUTOMATION_CREATED",
            message: "Automation created successfully",
        },
        FETCHED: {
            code: "AUTOMATION_FETCHED",
            message: "Automations retrieved successfully",
        },
        FETCHED_ONE: {
            code: "AUTOMATION_FETCHED_ONE",
            message: "Automation retrieved successfully",
        },
        UPDATED: {
            code: "AUTOMATION_UPDATED",
            message: "Automation updated successfully",
        },
        DELETED: {
            code: "AUTOMATION_DELETED",
            message: "Automation deleted successfully",
        },
        NOT_FOUND: {
            code: "AUTOMATION_NOT_FOUND",
            message: "Automation not found",
        }
    },
    USER: {
        CREATED: {
            code: "USER_CREATED",
            message: "create user successfully"
        },
        MENTION_FETCHED: {
            code: "MENTION_USERS_FETCHED",
            message: "Users fetched successfully for mention",
        },
        FETCHED: {
            code: "USER_FETCHED",
            message: "User fetched successfully",
        },
        PROFILE_UPDATED: {
            code: "USER_PROFILE_UPDATED",
            message: "User profile updated successfully",
        },
        PROFILE_FETCHED: {
            code: "USER_PROFILE_FETCHED",
            message: "User profile fetched successfully",
        },
        VALIDATION_ERROR: {
            code: "USER_VALIDATION_ERROR",
            message: "Validation error",
        },
        UPDATE_ERROR: {
            code: "USER_UPDATE_ERROR",
            message: "Error updating profile",
        },
        NOT_FOUND: {
            code: "USER_NOT_FOUND",
            message: "user not found"
        },
        NOT_IN_WORKSPACE: {
            code: 'USER_NOT_IN_WORKSPACE',
            message: 'User not in this workspace',
        },
        BAD_REQUEST: {
            code: 'USER_BAD_REQUEST',
            message: 'Invalid user request',
        },
    },
    ANALYTICS: {
        code: "ANALYTICS_FETCHED",
        message: "get analytics successfull"
    },
    AUTH: {
        INVALID_CREDENTIALS: {
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Invalid email or password"
        },
        UNAUTHORIZED: {
            code: "AUTH_UNAUTHORIZED",
            message: "Unauthorized access"
        },
        LOGIN_SUCCESS: {
            code: "AUTH_LOGIN_SUCCESS",
            message: "Login successful",
        },
        LOGOUT_SUCCESS: {
            code: "AUTH_LOGOUT_SUCCESS",
            message: "Logout successful",
        },
    },
    GENERAL: {
        SUCCESS: {
            code: "SUCCESS",
            message: "Operation successful"
        },
        INTERNAL_SERVER_ERROR: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error"
        }
    },
    COMMON: {
        VALIDATION_ERROR: {
            code: "VALIDATION_ERROR",
            message: "Validation failed"
        }
    },
    COMMENT: {
        CREATED: {
            code: "COMMENT_CREATED",
            message: "Comment created successfully",
        },
        UPDATED: {
            code: "COMMENT_UPDATED",
            message: "Comment updated successfully",
        },
        DELETED: {
            code: "COMMENT_DELETED",
            message: "Comment deleted successfully",
        },
        FETCHED: {
            code: "COMMENT_FETCHED",
            message: "Comments fetched successfully",
        },
        COMMENT_NOT_FOUND: {
            message: "Comment not found",
            code: "COMMENT_NOT_FOUND",
        },
        UPDATE_FAILED: {
            message: "Failed to update comment",
            code: "COMMENT_UPDATE_FAILED",
        },
    },
    TASK: {
        CREATED: {
            code: "TASK_CREATED",
            message: "Task created successfully",
        },
        CLONE: {
            code: "TASK_CLONE",
            message: "Task cloned successfully",
        },
        FETCHED: {
            code: "TASK_FETCHED",
            message: "Task fetched successfully",
        },
        ALL_FETCHED: {
            code: "TASKS_FETCHED",
            message: "All tasks fetched successfully",
        },
        UPDATED: {
            code: "TASK_UPDATED",
            message: "Task updated successfully",
        },
        DELETED: {
            code: "TASK_DELETED",
            message: "Task deleted successfully",
        },
        UNDO: {
            code: "TASK_UNDONE",
            message: "Undo task successfully",
        },
        REDO: {
            code: "TASK_REDONE",
            message: "Redo task successfully",
        },
        NOT_FOUND: {
            message: "Task not found or does not belong to workspace",
            code: "TASK_NOT_FOUND",
        },

        CREATE_SUCCESS: {
            code: "TASK_CREATED",
            message: "Task created successfully",
        },

        UPDATE_SUCCESS: {
            code: "TASK_UPDATED",
            message: "Task updated successfully",
        },

        DELETE_SUCCESS: {
            code: "TASK_DELETED",
            message: "Task deleted successfully",
        },

        FETCH_SUCCESS: {
            code: "TASK_FETCHED",
            message: "Task fetched successfully",
        },

        FETCH_ALL_SUCCESS: {
            code: "TASKS_FETCHED",
            message: "Tasks fetched successfully",
        },

        UNDO_SUCCESS: {
            code: "TASK_UNDO_SUCCESS",
            message: "Task change undone successfully",
        },

        REDO_SUCCESS: {
            code: "TASK_REDO_SUCCESS",
            message: "Task change redone successfully",
        },

        PROJECT_NOT_FOUND: {
            code: "PROJECT_NOT_FOUND",
            message: "Project not found or does not belong to this workspace",
        },

        TASK_NOT_FOUND: {
            code: "TASK_NOT_FOUND",
            message: "Task not found",
        },

        TASK_NOT_IN_PROJECT: {
            code: "TASK_NOT_IN_PROJECT",
            message: "Task not found or does not belong to this project",
        },

        TASK_NOT_IN_WORKSPACE: {
            code: "TASK_NOT_IN_WORKSPACE",
            message: "Task not found or does not belong to the specified workspace",
        },

        ASSIGNED_USER_NOT_MEMBER: {
            code: "ASSIGNED_USER_NOT_MEMBER",
            message: "Assigned user is not a member of this workspace",
        },

        UPDATE_FAILED: {
            code: "TASK_UPDATE_FAILED",
            message: "Failed to update task",
        },

        LOG_NOT_FOUND: {
            code: "TASK_LOG_NOT_FOUND",
            message: "Log not found for this task",
        },

        LOG_ALREADY_UNDONE: {
            code: "TASK_LOG_ALREADY_UNDONE",
            message: "Log already undone",
        },

        LOG_NOT_UNDONE: {
            code: "TASK_LOG_NOT_UNDONE",
            message: "Log is not undone",
        },
    },
    WORKSPACE: {
        JOINED: {
            code: "WORKSPACE_JOINED",
            message: "Successfully joined the workspace"
        },
        NOT_FOUND: {
            code: "WORKSPACE_NOT_FOUND",
            message: "Workspace not found",
        },
        INVALID_INVITE: {
            code: "INVALID_INVITE_CODE",
            message: "Invalid invite code or workspace not found",
        },
        ALREADY_MEMBER: {
            code: "ALREADY_MEMBER",
            message: "You are already a member of this workspace",
        },
        ACCESS_UNAUTHORIZED: {
            code: "WORKSPACE_ACCESS_UNAUTHORIZED",
            message: "You are not a member of this workspace",
        },
        CREATED: {
            code: "WORKSPACE_CREATED",
            message: "Workspace created successfully"
        },
        FETCHED: {
            code: "WORKSPACE_FETCHED",
            message: "Workspace fetched successfully"
        },
        LIST_FETCHED: {
            code: "USER_WORKSPACES_FETCHED",
            message: "User workspaces fetched successfully"
        },
        MEMBERS_FETCHED: {
            code: "WORKSPACE_MEMBERS_FETCHED",
            message: "Workspace members retrieved successfully"
        },
        ANALYTICS_FETCHED: {
            code: "WORKSPACE_ANALYTICS_FETCHED",
            message: "Workspace analytics retrieved successfully"
        },
        ROLE_CHANGED: {
            code: "WORKSPACE_MEMBER_ROLE_CHANGED",
            message: "Member role changed successfully"
        },
        UPDATED: {
            code: "WORKSPACE_UPDATED",
            message: "Workspace updated successfully"
        },
        DELETED: {
            code: "WORKSPACE_DELETED",
            message: "Workspace deleted successfully"
        },
        OWNER_ROLE_NOT_FOUND: {
            code: "OWNER_ROLE_NOT_FOUND",
            message: "Owner role not found",
        },
        WORKSPACE_NOT_FOUND: {
            code: "WORKSPACE_NOT_FOUND",
            message: "Workspace not found",
        },
        ROLE_NOT_FOUND: {
            code: "ROLE_NOT_FOUND",
            message: "Role not found",
        },
        MEMBER_NOT_FOUND: {
            code: "MEMBER_NOT_FOUND",
            message: "Member not found in the workspace",
        },
        NOT_AUTHORIZED_DELETE: {
            code: "NOT_AUTHORIZED_TO_DELETE_WORKSPACE",
            message: "You are not authorized to delete this workspace",
        }
    },
    ROLE: {
        NOT_FOUND: {
            code: "ROLE_NOT_FOUND",
            message: "Role not found",
        },
    },
    NOTIFICATION: {
        FETCHED: {
            code: "NOTIFICATIONS_FETCHED",
            message: "Notifications fetched successfully",
        },
        READ: {
            code: "NOTIFICATION_READ",
            message: "Notification marked as read successfully",
        },
        READ_ALL: {
            code: "NOTIFICATIONS_READ_ALL",
            message: "All notifications marked as read",
        },
        NOT_FOUND: {
            code: "NOTIFICATION_NOT_FOUND",
            message: "Notification remove successfully"
        }
    },
    TASK_LOG: {
        FETCHED: {
            code: "TASK_LOGS_FETCHED",
            message: "Task logs fetched successfully",
        },
        TASK_NOT_FOUND: {
            code: "TASK_NOT_FOUND",
            message: "Task not found",
        },
        UPDATED: {
            code: "TASK_UPDATED",
            message: "Task updated successfully",
        }
    },
    PROJECT: {
        CREATED: {
            code: "PROJECT_CREATED",
            message: "Project created successfully",
        },
        FETCHED: {
            code: "PROJECT_FETCHED",
            message: "Project fetched successfully",
        },
        ANALYTICS_FETCHED: {
            code: "PROJECT_ANALYTICS_FETCHED",
            message: "Project analytics retrieved successfully",
        },
        UPDATED: {
            code: "PROJECT_UPDATED",
            message: "Project updated successfully",
        },
        DELETED: {
            code: "PROJECT_DELETED",
            message: "Project deleted successfully",
        },
        NOT_FOUND: {
            code: "PROJECT_NOT_FOUND",
            message: "Project not found or does not belong to the specified workspace",
        },
    }
} as const;
