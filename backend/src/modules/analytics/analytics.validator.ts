import z from "zod";
import { userIdSchema, workspaceIdSchema } from "../../common/validator/common.validator";

export const DateSchema = z
    .union([z.string(), z.date()])
    .optional()
    .refine(
        (val) => {
            if (!val) return true;
            if (val instanceof Date) return !isNaN(val.getTime());
            return !isNaN(Date.parse(val));
        },
        { message: "Invalid date format." }
    )
    .transform((val) => {
        if (!val) return undefined;
        return val instanceof Date ? val : new Date(val);
    });

export const profileActivitySchema = z.object({
    userId: userIdSchema,
    workspaceId: workspaceIdSchema,
    date: DateSchema
});
