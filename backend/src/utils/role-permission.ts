import {
  Permissions,
  PermissionType,
  RoleType,
} from "../common/enums/role.enum";

export const RolePermissions: Record<RoleType, Array<PermissionType>> = {
  OWNER: [
    Permissions.CREATE_WORKSPACE,
    Permissions.EDIT_WORKSPACE,
    Permissions.DELETE_WORKSPACE,
    Permissions.MANAGE_WORKSPACE_SETTINGS,

    Permissions.ADD_MEMBER,
    Permissions.CHANGE_MEMBER_ROLE,
    Permissions.REMOVE_MEMBER,

    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,

    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,

    Permissions.CREATE_COMMENT,
    Permissions.EDIT_COMMENT,
    Permissions.DELETE_COMMENT,

    Permissions.VIEW_ONLY,

    Permissions.UNDO_TASK,
    Permissions.REDO_TASK,

    Permissions.CREATE_AUTOMATION,
    Permissions.EDIT_AUTOMATION,
    Permissions.DELETE_AUTOMATION,

    Permissions.VIEW_ANALYTICS
  ],
  ADMIN: [
    Permissions.ADD_MEMBER,
    Permissions.CREATE_PROJECT,
    Permissions.EDIT_PROJECT,
    Permissions.DELETE_PROJECT,
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,
    Permissions.DELETE_TASK,
    Permissions.MANAGE_WORKSPACE_SETTINGS,
    Permissions.VIEW_ONLY,

    Permissions.CREATE_COMMENT,
    Permissions.EDIT_COMMENT,
    Permissions.DELETE_COMMENT,

    Permissions.UNDO_TASK,
    Permissions.REDO_TASK,

    Permissions.CREATE_AUTOMATION,
    Permissions.EDIT_AUTOMATION,
    Permissions.DELETE_AUTOMATION,

    Permissions.VIEW_ANALYTICS
  ],
  MEMBER: [
    Permissions.VIEW_ONLY,
    Permissions.CREATE_TASK,
    Permissions.EDIT_TASK,

    Permissions.CREATE_COMMENT,
    Permissions.EDIT_COMMENT,
    Permissions.DELETE_COMMENT,

    Permissions.CREATE_AUTOMATION,
    Permissions.EDIT_AUTOMATION,
    Permissions.DELETE_AUTOMATION,

    Permissions.DELETE_TASK,
    Permissions.UNDO_TASK,
    Permissions.REDO_TASK,

    Permissions.VIEW_ANALYTICS
  ],
};
