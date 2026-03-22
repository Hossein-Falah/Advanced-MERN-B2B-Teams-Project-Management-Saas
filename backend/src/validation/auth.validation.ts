import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(1)
  .max(255);

export const passwordSchema = z.string().trim().min(4);

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string()
    .trim()
    .regex(/^09\d{9}$/, "شماره موبایل باید با 09 شروع شود و 11 رقم باشد")
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
