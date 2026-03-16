export const TaskLogActionEnumType = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
} as const;

export type TaskLogActionType = keyof typeof TaskLogActionEnumType;

