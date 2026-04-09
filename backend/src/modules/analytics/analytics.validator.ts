import z from "zod";
import { workspaceIdSchema } from "../workspace/workspace.validation";

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
    workspaceId: workspaceIdSchema,
    date: DateSchema
});
