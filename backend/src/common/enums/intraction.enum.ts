export const IntractionTypeEnum = {
    TASK_REPETITION: "TASK_REPETITION"
} as const;

export type IntractionType = keyof typeof IntractionTypeEnum;
