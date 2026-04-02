import { z } from "zod";

const workScheduleSchema = z.object({
    workingDays: z.array(z.coerce.number().min(0).max(6)).optional(),
    startHour: z.coerce.number().min(0).max(23).optional(),
    endHour: z.coerce.number().min(0).max(23).optional()
}).optional();


const ConditionsSchema = z.object({
    onCreateTask: z.boolean().optional(),
    onUpdateTask: z.boolean().optional(),
    onMention: z.boolean().optional(),
    onAutomationAction: z.boolean().optional(),
    onMessage: z.boolean().optional()
}).optional();


export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(255).optional(),
    username: z.string().trim().min(1).max(255).optional(),
    phone: z.string()
        .trim()
        .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود و 11 رقم باشد")
        .optional(),
    bio: z.string().trim().max(500).optional(),
    jobTitle: z.string().trim().max(500).optional(),

    region: z.string().optional(),

    weekStartDay: z.coerce.number().min(0).max(6).optional(),

    workSchedule: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(workScheduleSchema)
        .optional(),

    notifConditions: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(ConditionsSchema)
        .optional(),

    smsConditions: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(ConditionsSchema)
        .optional()
});
