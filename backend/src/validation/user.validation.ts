import { z } from "zod";

export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(255),
    username: z.string().trim().min(1).max(255),
    phone: z.string()
        .trim()
        .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود و 11 رقم باشد")
});
