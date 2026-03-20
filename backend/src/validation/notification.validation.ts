import { z } from "zod";

export const notificationIdSchema = z.string().trim().min(1);
