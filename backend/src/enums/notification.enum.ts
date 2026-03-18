export const NotificationTypeEnum = {
    TASK_ASSIGNED: "TASK_ASSIGNED",
    MENTION: "MENTION"
} as const;

export type NotificationType = keyof typeof NotificationTypeEnum;
