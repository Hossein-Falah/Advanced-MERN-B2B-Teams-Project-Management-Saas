export const NotificationTypeEnum = {
    TASK_ASSIGNED: "TASK_ASSIGNED",
    TASK_UPDATED: "TASK_UPDATED",
    MENTION: "MENTION"
} as const;

export type NotificationType = keyof typeof NotificationTypeEnum;
