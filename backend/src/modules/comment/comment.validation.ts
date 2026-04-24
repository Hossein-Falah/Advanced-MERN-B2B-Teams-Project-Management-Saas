import { z } from "zod";
import { removeAttachmentIdsSchema } from "../task/task.validation";

export const contentSchema = z.string().trim().min(1);

export const taskSchema = z.string().trim().min(1);
export const workspaceSchema = z.string().trim().min(1);
export const userSchema = z.string().trim().min(1);

export const commentIdSchema = z.string().trim().min(1);

export const commentSchema = z.object({
    content: contentSchema,
    removeAttachmentIds: removeAttachmentIdsSchema
});
